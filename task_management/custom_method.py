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
			return doc.name

@frappe.whitelist()
def close_task(docname,closure_remark,ok_for_closure, closure_date):
	doc = frappe.get_doc('Task', docname)
	doc.closure_remark = closure_remark
	doc.ok_for_closure = ok_for_closure
	doc.closure_date = closure_date

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