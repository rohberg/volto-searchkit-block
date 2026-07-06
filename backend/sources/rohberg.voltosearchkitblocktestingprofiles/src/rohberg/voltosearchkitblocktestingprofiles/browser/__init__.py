from collective.elastic.plone import INDEX_NAME
try:
    from collective.elastic.ingest.celery import deleteindex
except ImportError:
    deleteindex = None
from Products.Five.browser import BrowserView


class ClearIndex(BrowserView):
    def __call__(self):
        # Delete index
        if deleteindex is not None:
            deleteindex.delay(INDEX_NAME)

        return f"Index '{INDEX_NAME}' deleted."
