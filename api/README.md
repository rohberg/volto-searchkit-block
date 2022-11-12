# Backend Plone 6

Installation with pip and mxdev


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

Generate your Zope configuration with cookiecutter.
This is also necessary after changes of `instance.yaml`.

```shell
cookiecutter -f --no-input --config-file instance.yaml https://github.com/plone/cookiecutter-zope-instance
```

Run Zope:

```shell
runwsgi instance/etc/zope.ini
```

Voilà, your Plone is up and running on http://localhost:8080.


### All commands

```
python -m venv venv
source venv/bin/activate
pip install -U pip wheel mxdev

mxdev -c mx.ini
pip install -r requirements-mxdev.txt
cookiecutter -f --no-input --config-file instance.yaml https://github.com/plone/cookiecutter-zope-instance
runwsgi instance/etc/zope.ini
```


## Troubleshooting

### "The 'Paste' distribution was not found and is required by the application"

Be sure to activate the Python virtual environment.

```shell
source venv/bin/activate
runwsgi instance/etc/zope.ini
```
