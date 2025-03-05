# Call reindexing
# /@@clear-and-update-index-server-index

import os
import time


time.sleep(20)

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


ISMULTILINGUAL = asbool(os.getenv("ISMULTILINGUAL"))
if ISMULTILINGUAL:
    site_id = "Multilingual"
else:
    site_id = "Plone"

print(f"** reindexing site. {site_id}")
# TODO Call /@@clear-and-update-index-server-index
