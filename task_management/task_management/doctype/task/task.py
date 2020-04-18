# -*- coding: utf-8 -*-
# Copyright (c) 2020, hello@openetech.com and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document
from frappe import utils
from frappe.utils import date_diff

class Task(Document):
	def validate(self):
		if date_diff(self.target_date, self.creation_date) < 0:
			frappe.throw(_("Target Date cannot be less than creation date"))