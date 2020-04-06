from frappe import _

@frappe.whitelist()
def getDuplicate():
	frappe.throw(_("dupliate document"))
	# doc_m = frappe.get_doc("Task", source_name)
	# doc_m.set('parent_task_id','001')
	# doc_m.save()
	# doc_m.submit();

# @frappe.whitelist()
# def generate_auto_name():
# 	print('Auto generate name')