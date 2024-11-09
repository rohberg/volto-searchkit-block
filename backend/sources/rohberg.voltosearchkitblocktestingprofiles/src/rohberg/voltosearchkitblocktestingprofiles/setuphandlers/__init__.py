from plone.app.multilingual.setuphandlers import init_pam
from rohberg.voltosearchkitblocktestingprofiles import logger
from Products.CMFPlone.interfaces import INonInstallable
from zope.interface import implementer


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


def multilingual(tool):
    init_pam()
    # TODO enable behavior 'volto.blocks'
    logger.info(
        "rohberg.voltosearchkitblocktestingprofiles:multilingual profile applied."
        )
