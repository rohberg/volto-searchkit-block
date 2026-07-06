from plone.app.multilingual.setuphandlers import enable_translatable_behavior, init_pam
from rohberg.voltosearchkitblocktestingprofiles import logger
from Products.CMFPlone.interfaces import INonInstallable
from zope.interface import implementer
from zope.component.hooks import getSite


@implementer(INonInstallable)
class HiddenProfiles:
    def getNonInstallableProfiles(self):
        """Hide uninstall profile from site-creation and quickinstaller."""
        return [
            "rohberg.voltosearchkitblocktestingprofiles:install",
            "rohberg.voltosearchkitblocktestingprofiles:uninstall",
            "rohberg.voltosearchkitblocktestingprofiles:monolingual",
            "rohberg.voltosearchkitblocktestingprofiles:multilingual",
        ]


def init_multilingual(tool):
    init_pam(tool)
    portal = getSite()
    enable_translatable_behavior(portal)
    logger.info(
        "profile rohberg.voltosearchkitblocktestingprofiles:multilingual applied."
    )
