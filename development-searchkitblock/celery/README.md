# Installation with pip and mxdev


```shell
python -m venv venv
source venv/bin/activate
pip install -U pip wheel mxdev
mxdev -c mx.ini
```

Install your Plone packages, core and add-ons:

```shell
pip install -r requirements-mxdev.txt
```


Run celery

```shell
source .env
celery -A collective.elastic.ingest.celery.app worker -l debug
```
