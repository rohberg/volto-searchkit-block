from plone.distribution.api import site as site_api

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
ISMULTILINGUAL = asbool(os.getenv("ISMULTILINGUAL"))

app = makerequest(globals()["app"])

request = app.REQUEST

ifaces = [IBrowserLayer] + list(directlyProvidedBy(request))

directlyProvides(request, *ifaces)

admin = app.acl_users.getUserById("admin")
admin = admin.__of__(app.acl_users)
newSecurityManager(None, admin)

answers = {
    "portal_timezone": "UTC",
    "setup_content": EXAMPLE_CONTENT,
}
if ISMULTILINGUAL:
    distribution_name = "multilingualexamplecontent"
    answers["site_id"] = "Multilingual"
    answers["title"] = "Multilingual"
    answers["description"] = "A new Plone site using the multilingual distribution"
else:
    distribution_name = "monolingualexamplecontent"
    answers["site_id"] = "Plone"
    answers["title"] = "Plone"
    answers["description"] = "A new Plone site using the monolingual distribution"

if answers["site_id"] in app.objectIds() and DELETE_EXISTING:
    app.manage_delObjects([answers["site_id"]])
    transaction.commit()
    app._p_jar.sync()
    print("Wait until site is deleted, before creating a new one.")
    time.sleep(20)

if answers["site_id"] not in app.objectIds():
    print("Creating new site.")
    site = site_api.create(app, distribution_name, answers)
