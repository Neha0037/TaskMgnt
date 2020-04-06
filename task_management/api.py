from frappe import _
import frappe

def generate_auto_name(doc,method):
	sr_no = frappe.db.sql('''Select count(name)+1 from tabTask''')
	sr_no = sr_no[0][0]
	doc.name = doc.owner + '/' +str(sr_no)
	# frappe.throw(_('Auto generate name'))
