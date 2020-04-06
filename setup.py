# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in task_management/__init__.py
from task_management import __version__ as version

setup(
	name='task_management',
	version=version,
	description='Task Management',
	author='salesandsupport@openetech.com',
	author_email='salesandsupport@openetech.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
