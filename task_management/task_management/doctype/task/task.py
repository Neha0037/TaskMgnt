# -*- coding: utf-8 -*-
# Copyright (c) 2020, salesandsupport@openetech.com and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe import _
from frappe import utils

class Task(Document):
	def delegate_task(self):
		#to create duplicate(child task)
		doc1 = frappe.get_doc('Task',self.name)
		doc = frappe.get_doc({
		    'doctype': 'Task'
		})
		doc = doc1
		doc.parent_task_id = self.name
		doc.parent_task_status = 'Open'
		doc.insert()

		#to update child task in parent task
		doc1 = frappe.get_doc('Task',self.name)
		doc1.child_task_id = doc.name
		doc1.child_task_status = 'Open'
		doc1.save()
		self.reload()

	def close_task(self):
		if not self.closure_remark:
			frappe.throw('Closure Remark is required')
		
		if not self.ok_for_closure:
			frappe.throw('Check the checkbox "OK for Closure"')
		
		#to update value in child task
		if self.child_task_id:
			if self.child_task_status != 'Close':
				frappe.throw('Child task status has to be Close')
			else:
				doc1 = frappe.get_doc('Task',self.child_task_id)
				doc1.parent_task_status = 'Close'
				doc1.save()

		#to update value in parent task
		if self.parent_task_id:
			doc = frappe.get_doc('Task',self.parent_task_id)
			doc.child_task_status = 'Close'
			doc.save()

		self.closure_date = utils.now()
		self.save()
		self.reload()


