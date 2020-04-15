# -*- coding: utf-8 -*-
# Copyright (c) 2020, hello@openetech.com and contributors
# For license information, please see license.txt
from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document
from frappe import utils

@frappe.whitelist()
def delegate_task(docname,assigned_to):
	doc1 = frappe.get_doc('Task', docname)
	if doc1.child_task_id:
		frappe.throw(_("Child Task is already created"))
	else:
		doc = frappe.get_doc({'doctype': 'Task'})
		doc.task_description = doc1.task_description 
		doc.task_reference = doc1.task_reference
		doc.year = doc1.year
		doc.month = doc1.month
		doc.task_owner = assigned_to
		doc.creation_date = doc1.creation
		doc.parent_task_id = docname
		doc.parent_task_status = 'Open'
		doc.insert(ignore_mandatory=True)
		#to update child task in parent task
		if doc.name:
			create_user_permission('Task',doc.name,doc.task_owner,doc.assigned_to)
			return doc.name

@frappe.whitelist()
def close_task(docname, closure_remark, ok_for_closure, closure_date):
	doc = frappe.get_doc('Task', docname)
	doc.closure_remark = closure_remark
	doc.ok_for_closure = ok_for_closure
	doc.closure_date = closure_date

	if frappe.db.get_single_value('Task Management Setting', 'validate_parent_child_task') and
		doc.child_task_id and doc.child_task_status == 'Open':
			frappe.throw(_('Child task status has to be Closed'))

	if doc.closure_date :
		if doc.parent_task_id:
			doc1 = frappe.get_doc('Task', doc.parent_task_id)
			doc1.child_task_status = 'Closed'
			doc1.save()
			doc.save()
			doc.submit()

		if doc.child_task_id:
			doc1 = frappe.get_doc('Task', doc.child_task_id)
			doc1.parent_task_status = 'Closed'
			doc1.save()
			doc.save()
			doc.submit()

		doc.save()
		doc.submit()

@frappe.whitelist()
def create_user_permission(doctype, docname, task_owner, assigned_to = None):
	records = frappe.db.get_value('User Permission',{'for_value':docname},['name','user'])
	if records:
		for record in records:
			frappe.db.delete('User Permission',record)

	name = frappe.db.get_value('User Permission', {'for_value': docname ,'user': task_owner, 'allow': doctype , 'applicable_for': doctype}, ['name'])
	if not name:
		doc = frappe.get_doc({'doctype':'User Permission'})
		doc.user = task_owner
		doc.allow = doctype
		doc.for_value = docname
		doc.apply_to_all_doctypes = 0
		doc.applicable_for = doctype
		doc.save()
	if assigned_to:
		name = frappe.db.get_value('User Permission', {'for_value': docname ,'user': assigned_to, 'allow': doctype , 'applicable_for': doctype}, ['name'])
		if not name:
			doc = frappe.get_doc({'doctype':'User Permission'})
			doc.user = assigned_to
			doc.allow = doctype
			doc.for_value = docname
			doc.apply_to_all_doctypes = 0
			doc.applicable_for = doctype
			doc.save()