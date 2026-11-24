from django.core.exceptions import ValidationError
from django.test import SimpleTestCase

from .models import default_zonal_hierarchy_config, validate_zonal_hierarchy_config


class CustomerZonalHierarchyConfigTests(SimpleTestCase):
    def test_default_is_zone_circle_branch_floor(self):
        config = default_zonal_hierarchy_config()
        self.assertEqual(config["levels"], ["zone", "circle", "branch", "floor"])
        self.assertTrue(validate_zonal_hierarchy_config(config))

    def test_zone_region_branch_floor_is_valid(self):
        self.assertTrue(validate_zonal_hierarchy_config({
            "version": 1, "levels": ["zone", "region", "branch", "floor"]
        }))

    def test_circle_and_region_and_division_can_all_be_selected(self):
        self.assertTrue(validate_zonal_hierarchy_config({
            "version": 1,
            "levels": ["zone", "circle", "region", "division", "branch", "floor"],
        }))

    def test_circle_region_branch_is_valid_without_division(self):
        self.assertTrue(validate_zonal_hierarchy_config({
            "version": 1,
            "levels": ["zone", "circle", "region", "branch", "floor"],
        }))

    def test_physical_hierarchy_can_skip_building(self):
        self.assertTrue(validate_zonal_hierarchy_config({
            "version": 1,
            "levels": ["zone", "circle", "branch", "floor", "room"],
        }))

    def test_building_floor_room_is_valid(self):
        self.assertTrue(validate_zonal_hierarchy_config({
            "version": 1,
            "levels": ["zone", "region", "branch", "building", "floor", "room"],
        }))

    def test_division_requires_region(self):
        with self.assertRaises(ValidationError):
            validate_zonal_hierarchy_config({
                "version": 1,
                "levels": ["zone", "circle", "division", "branch", "floor"],
            })

    def test_administrative_order_cannot_be_changed(self):
        with self.assertRaises(ValidationError):
            validate_zonal_hierarchy_config({
                "version": 1,
                "levels": ["zone", "region", "circle", "branch", "floor"],
            })

    def test_room_requires_floor(self):
        with self.assertRaises(ValidationError):
            validate_zonal_hierarchy_config({
                "version": 1,
                "levels": ["zone", "circle", "branch", "room"],
            })

    def test_building_must_precede_floor(self):
        with self.assertRaises(ValidationError):
            validate_zonal_hierarchy_config({
                "version": 1,
                "levels": ["zone", "circle", "branch", "floor", "building"],
            })

    def test_circle_or_region_is_required(self):
        with self.assertRaises(ValidationError):
            validate_zonal_hierarchy_config({
                "version": 1, "levels": ["zone", "branch", "floor"]
            })


class DirectZoneBranchConfigurationTests(TestCase):
    def test_zone_can_be_direct_branch_parent(self):
        from account.models import validate_zonal_hierarchy_config
        self.assertTrue(validate_zonal_hierarchy_config({
            "version": 1,
            "levels": ["zone", "branch", "floor"],
        }))
