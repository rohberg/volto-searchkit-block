"""Init and utils."""

from zope.i18nmessageid import MessageFactory

import logging


PACKAGE_NAME = "searchkit.block"

_ = MessageFactory(PACKAGE_NAME)

logger = logging.getLogger(PACKAGE_NAME)
