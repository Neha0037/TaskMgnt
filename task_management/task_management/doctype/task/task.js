// Copyright (c) 2020, hello@openetech.com and contributors
// For license information, please see license.txt

frappe.ui.form.on('Task', {
	onload: function(frm, cdt, cdn) {
		if(!frm.doc.task_owner) {
			frm.set_value('task_owner',frm.doc.owner);
		}
		if (frm.doc.docstatus == 0)
			{	frm.toggle_enable(['task_description', 'task_reference','year','month','task_owner','assigned_to','target_date'],((frm.doc.task_owner == frappe.session.user_email) || (frm.doc.task_owner == frappe.session.user)));
				frm.toggle_display(['assign_back','delegate','ok_for_closure','close', 'closure_remark'], !((frm.doc.task_owner == frappe.session.user_email) || (frm.doc.task_owner == frappe.session.user)));
				frm.toggle_display(['assign_back','delegate','ok_for_closure','close', 'closure_remark'], (frappe.session.user_email== frm.doc.assigned_to)||(frappe.session.user==frm.doc.assigned_to));
			}
		if (frm.doc.docstatus == 1) {
		cur_frm.fields.forEach(d => cur_frm.set_df_property(d.df.fieldname, 'read_only', true));
		}
	},
	validate: function(frm, cdt, cdn) {
		var long_desc = [cur_frm.doc.task_description , cur_frm.doc.task_reference, cur_frm.doc.year, cur_frm.doc.month].filter(Boolean).join("-");
		cur_frm.set_value('long_description',long_desc)
		if(!frm.doc.creation_date) {
			frm.set_value('creation_date',frappe.datetime.get_today());
		}
	},
	assign_back: function(frm, cdt, cdn) {
		if (frm.doc.docstatus === 0 && !frm.doc.child_task_id)
			{
				frm.set_value('assigned_to',frm.doc.owner);
				cur_frm.save();
				cur_frm.refresh_field('assigned_to');
				if (frm.doc.docstatus == 0)
					{	frm.toggle_enable(['task_description', 'task_reference','year','month','task_owner','assigned_to','target_date'],((frm.doc.task_owner == frappe.session.user_email) || (frm.doc.task_owner == frappe.session.user)));
						frm.toggle_display(['assign_back','delegate','ok_for_closure','close', 'closure_remark'], !((frm.doc.task_owner == frappe.session.user_email) || (frm.doc.task_owner == frappe.session.user)));
						frm.toggle_display(['assign_back','delegate','ok_for_closure','close', 'closure_remark'], (frappe.session.user_email== frm.doc.assigned_to)||(frappe.session.user==frm.doc.assigned_to));
					}
				if (frm.doc.docstatus == 1) {
				cur_frm.fields.forEach(d => cur_frm.set_df_property(d.df.fieldname, 'read_only', true));
				}
				cur_frm.refresh();
				frappe.msgprint("Task is assigned back to Owner")
			} else
			{
				frappe.msgprint("Task cannot be assigned back as child task already exists")
			}
	},
	delegate: function(frm, cdt, cdn) {
		if (frm.doc.docstatus === 0 && ! frm.doc.child_task_id) {
			frappe.call({
				method: "task_management.custom_method.delegate_task",
				args: { docname: frm.doc.name, assigned_to: frm.doc.assigned_to },
				callback: function(r) {
					frm.set_value('child_task_id', r.message);
					frm.set_value('child_task_status', "Open");
					cur_frm.save();
					cur_frm.refresh();
					frappe.msgprint('New child task is created')
				}
			})
		} else {
			frappe.msgprint('Child Task is already created or document is already submitted')
		}
	},
	close: function(frm, cdt, cdn) {
		if (frm.doc.docstatus === 0) {
			if (frm.doc.closure_remark) {
				if (frm.doc.ok_for_closure) {
					frm.set_value('closure_date',frappe.datetime.get_today())
					frappe.call({
						method: "task_management.custom_method.close_task",
						args: { docname: frm.doc.name, closure_remark: frm.doc.closure_remark, ok_for_closure: frm.doc.ok_for_closure, closure_date: frm.doc.closure_date},
						callback: function(r) {
							frm.reload_doc();
						}
					})
				} else {
					frappe.throw('Click on check box for closure')
				}

			} else{
				frappe.throw('Closure Remark is mandatory for closure')
			}
		} else {
			frappe.throw('Document is already closed')
		}
	},
	before_submit: function(frm, cdt, cdn) {
		if (!frm.doc.closure_remark){
			frappe.throw('Closure Remark is mandatory for closure')
		}
		if (!frm.doc.ok_for_closure) {
			frappe.throw('Click on check box for closure') 
		} 
		if (!frm.doc.closure_date) {
			frappe.throw('Click the close button')
		}	
	},
	after_save: function(frm,cdt,cdn) {
		frappe.call({
			method: "task_management.custom_method.create_user_permission",
			args: { doctype: frm.doc.doctype, docname: frm.doc.name, task_owner: frm.doc.task_owner, assigned_to: frm.doc.assigned_to },
			callback: function(r) {
				frm.refresh();
			}
		})
	}

});