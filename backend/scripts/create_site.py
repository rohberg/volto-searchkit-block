from AccessControl.SecurityManagement import newSecurityManager
from Products.CMFPlone.factory import _DEFAULT_PROFILE
from Products.CMFPlone.factory import addPloneSite
from Products.GenericSetup.tool import SetupTool
from rohberg.voltosearchkitblocktestingprofiles.interfaces import IBrowserLayer
from Testing.makerequest import makerequest
from zope.interface import directlyProvidedBy
from zope.interface import directlyProvides

import os
import time
import transaction


truthy = frozenset(("t", "true", "y", "yes", "on", "1"))


def asbool(s):
    """Return the boolean value ``True`` if the case-lowered value of string
    input ``s`` is a :term:`truthy string`. If ``s`` is already one of the
    boolean values ``True`` or ``False``, return it."""
    if s is None:
        return False
    if isinstance(s, bool):
        return s
    s = str(s).strip()
    return s.lower() in truthy


DELETE_EXISTING = asbool(os.getenv("DELETE_EXISTING"))
EXAMPLE_CONTENT = asbool(
    os.getenv("EXAMPLE_CONTENT", "1")
)  # Create example content by default

app = makerequest(globals()["app"])

request = app.REQUEST

ifaces = [IBrowserLayer] + list(directlyProvidedBy(request))

directlyProvides(request, *ifaces)

admin = app.acl_users.getUserById("admin")
admin = admin.__of__(app.acl_users)
newSecurityManager(None, admin)

payload = {
    "title": "Project Title",
    "profile_id": _DEFAULT_PROFILE,
    "extension_ids": [
        "rohberg.voltosearchkitblocktestingprofiles:default",
        "collective.elastic.plone:default",
    ],
    "setup_content": False,
    "portal_timezone": "UTC",
}
ISMULTILINGUAL = asbool(os.getenv("ISMULTILINGUAL"))
if ISMULTILINGUAL:
    site_id = "Multilingual"
    payload["extension_ids"].append(
        "rohberg.voltosearchkitblocktestingprofiles:multilingual")
else:
    site_id = "Plone"
    payload["extension_ids"].append(
        "rohberg.voltosearchkitblocktestingprofiles:monolingual")

if site_id in app.objectIds() and DELETE_EXISTING:
    app.manage_delObjects([site_id])
    transaction.commit()
    app._p_jar.sync()

if site_id not in app.objectIds():
    site = addPloneSite(app, site_id, **payload)
    transaction.commit()
    if EXAMPLE_CONTENT:
        portal_setup: SetupTool = site.portal_setup
        if ISMULTILINGUAL:
            portal_setup.runAllImportStepsFromProfile(
                "rohberg.voltosearchkitblocktestingprofiles:initialmultilingual")
        else:
            portal_setup.runAllImportStepsFromProfile(
                "rohberg.voltosearchkitblocktestingprofiles:initialmonolingual")
        transaction.commit()
    app._p_jar.sync()
    time.sleep(30)
