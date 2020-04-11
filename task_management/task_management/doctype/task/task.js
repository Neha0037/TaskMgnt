// Copyright (c) 2020, hello@openetech.com and contributors
// For license information, please see license.txt

frappe.ui.form.on('Task', {
	onload: function(frm, cdt, cdn) {
		frm.refresh()
		frm.set_value('task_owner',frm.doc.owner);

		if (frm.doc.task_owner == frm.doc.owner) {
			frm.toggle_enable(['task_description', 'task_reference','year','month','task_owner','creation_date'],((frm.doc.task_owner == frappe.session.user_email) || (frm.doc.task_owner == frappe.session.user)));
			frm.toggle_display(['assign_back','delegate','closure_remark','ok_for_closure','close'],!((frm.doc.task_owner == frappe.session.user_email) || (frm.doc.task_owner == frappe.session.user)) );
		} 	
	},
	validate: function(frm, cdt, cdn) {
		var long_desc = [cur_frm.doc.task_description , cur_frm.doc.task_reference, cur_frm.doc.year, cur_frm.doc.month].filter(Boolean).join("-");
		cur_frm.set_value('long_description',long_desc)
		frm.set_value('creation_date',frappe.datetime.get_today());
	},
	assign_back: function(frm, cdt, cdn) {
		if (frm.doc.docstatus === 0)
			{
				frm.set_value('assigned_to',frm.doc.owner);
				cur_frm.save();
				cur_frm.refresh_field('assigned_to');
			}
	},
	delegate: function(frm, cdt, cdn) {
		if (!frm.doc.assigned_to) { frappe.throw('Assigned to field id mandatory')}
		if (frm.doc.docstatus === 0 && ! frm.doc.child_task_id) {
			frappe.call({
				method: "task_management.custom_method.delegate_task",
				args: { docname: frm.doc.name, assigned_to: frm.doc.assigned_to },
				callback: function(r) {
					frm.set_value('child_task_id', r.message);
					frm.set_value('child_task_status', "Open");
					cur_frm.save();
					cur_frm.refresh();
				}
			})
		} else {
			frappe.msgprint('Child Task is already created')
		}
	},
	close: function(frm, cdt, cdn) {
		if (frm.doc.docstatus === 0) {
			if(!frm.doc.child_task_id || (frm.doc.child_task_id && frm.doc.child_task_status == 'Closed')) {
				if(frm.doc.closure_remark) {
					if(frm.doc.ok_for_closure) {
						frm.set_value('closure_date',frappe.datetime.get_today())
						frappe.call({
							method: "task_management.custom_method.close_task",
							args: { docname: frm.doc.name ,closure_remark: frm.doc.closure_remark ,ok_for_closure: frm.doc.ok_for_closure, closure_date: frm.doc.closure_date},
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
			} else if (frm.doc.child_task_id && frm.doc.child_task_status == 'Open') {
				frappe.throw('Child task status has to be Closed')
			}
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
	}

});