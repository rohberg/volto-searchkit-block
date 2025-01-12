
# class ClearAndUpdateElastisearch(BrowserView):
#     def __call__(self):
#         # Delete index
#         if deleteindex is not None:
#             deleteindex.delay(INDEX_NAME)

#         # Index content
#         cat = api.portal.get_tool("portal_catalog")
#         count = 0
#         for path in cat._catalog.uids:
#             if path.endswith("/portal_catalog"):
#                 # no idea why it is in the list, ignore
#                 continue
#             index.delay(path, 0, INDEX_NAME)
#             count += 1
#         return f"Index '{INDEX_NAME}' rebuild."

from AccessControl.SecurityManagement import newSecurityManager
from collective.elastic.ingest.celery import index
from rohberg.voltosearchkitblocktestingprofiles.interfaces import IBrowserLayer
from Testing.makerequest import makerequest
from zope.interface import directlyProvidedBy
from zope.interface import directlyProvides

import os


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


INDEX_NAME = asbool(os.getenv("INDEX_NAME"))

app = makerequest(globals()["app"])

request = app.REQUEST

ifaces = [IBrowserLayer] + list(directlyProvidedBy(request))

directlyProvides(request, *ifaces)

admin = app.acl_users.getUserById("admin")
admin = admin.__of__(app.acl_users)
newSecurityManager(None, admin)


ISMULTILINGUAL = asbool(os.getenv("ISMULTILINGUAL"))
if ISMULTILINGUAL:
    site_id = "Multilingual"
else:
    site_id = "Plone"

if site_id in app.objectIds() and INDEX_NAME:
    site = app[site_id]
    cat = site.portal_catalog

    count = 0
    for path in cat._catalog.uids:
        if path.endswith("/portal_catalog"):
            # no idea why it is in the list, ignore
            continue
        index.delay(path, 0, INDEX_NAME)
        count += 1
    print(f"Index '{INDEX_NAME}' rebuild.")
