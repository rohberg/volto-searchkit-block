from plone.app.multilingual.browser.setup import SetupMultilingualSite
from rohberg.voltosearchkitblocktestingprofiles import logger
from Products.CMFPlone.interfaces import INonInstallable
from zope.component.hooks import getSite
from zope.interface import implementer


@implementer(INonInstallable)
class HiddenProfiles:
    def getNonInstallableProfiles(self):
        """Hide uninstall profile from site-creation and quickinstaller."""
        return [
            "project.title:uninstall",
        ]


def init_pam(tool):
    """After installation run setup to create LRF and LIF."""
    setup_tool = SetupMultilingualSite()
    setup_tool.setupSite(getSite())
    logger.info("plone.app.multilingual content created.")
