// Copyright (c) 2020, salesandsupport@openetech.com and contributors
// For license information, please see license.txt

frappe.ui.form.on('Task', {
	// refresh: function(frm) {

	// }
	onload(frm) {
		cur_frm.set_value('task_owner',cur_frm.doc.owner)
		cur_frm.set_value('creation_date',cur_frm.doc.creation)

		cur_frm.cscript.assign_back = function(doc) { 
			cur_frm.set_value('assigned_to',cur_frm.doc.task_owner)
		}

	},
	after_save(frm) {
		cur_frm.set_value('creation_date',cur_frm.doc.creation)
	}
});
