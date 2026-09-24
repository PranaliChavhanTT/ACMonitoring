# from django.apps import AppConfig


# class AccountConfig(AppConfig):
#     name = 'account'


from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "account"

    def ready(self):
        import account.signals