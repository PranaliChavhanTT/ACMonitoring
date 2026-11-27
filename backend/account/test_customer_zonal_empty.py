from unittest.mock import patch
from django.test import SimpleTestCase

from account.services.customer_hierarchy import initialize_customer_hierarchy


class ZonalCustomerStartsEmptyTests(SimpleTestCase):
    def test_zonal_initialization_does_not_read_json_or_create_nodes(self):
        customer = type("CustomerStub", (), {"hierarchy_type": "ZONAL", "pk": 123})()
        with patch("account.services.customer_hierarchy._tree_file") as tree_file:
            result = initialize_customer_hierarchy(customer)
        tree_file.assert_not_called()
        self.assertFalse(result["created"])
        self.assertEqual(result["reason"], "zonal_hierarchy_is_customer_managed")
        self.assertEqual(result["counts"]["zones"], 0)
