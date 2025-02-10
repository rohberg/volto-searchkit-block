from pathlib import Path
from plone import api
from plone.exportimport import importers
from Products.GenericSetup.tool import SetupTool
from rohberg.voltosearchkitblocktestingprofiles import logger


# TODO Replace create_example_content_multilingual with distribution (muli-lingual content) 
def create_example_content_multilingual(portal_setup: SetupTool):
    """Import content available at the examplecontent folder."""
    EXAMPLE_CONTENT_FOLDER = Path(__file__).parent / "examplecontent_multilingual"
    portal = api.portal.get()
    importer = importers.get_importer(portal)
    for line in importer.import_site(EXAMPLE_CONTENT_FOLDER):
        logger.info(line)
