"""Regression tests for the licensed photograph discovery/review boundary."""
import importlib.util
import json
import pathlib
import unittest

PATH = pathlib.Path(__file__).with_name('fetch-journal-photography.py')
SPEC = importlib.util.spec_from_file_location('journal_photography', PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class PhotographReviewTests(unittest.TestCase):
    def test_location_names_do_not_make_wildlife_academic(self):
        for title in ('Ardea cinerea head - Heidelberg.jpg',
                      'Rotkehlchen im Landschaftsschutzgebiet Heidelberg.jpg',
                      'Rhyticeros plicatus - Heidelberg.jpg'):
            self.assertFalse(MODULE.is_relevant_candidate(
                title, 'University town of Heidelberg, Germany', 'university-campus'))

    def test_museum_specimens_and_plaque_closeups_are_rejected(self):
        for title in ('Gomphotherium skeleton - University Museum.jpg',
                      'University of Warsaw plaque.jpg',
                      'Botanical Garden, University of Copenhagen.jpg'):
            self.assertFalse(MODULE.is_relevant_candidate(title, '', 'university-campus'))

    def test_named_academic_and_laboratory_contexts_are_candidates(self):
        self.assertTrue(MODULE.is_relevant_candidate(
            'Heidelberg University inner courtyard.jpg', '', 'university-campus'))
        self.assertTrue(MODULE.is_relevant_candidate(
            'Copenhagen University Library interior.jpg', '', 'library'))
        self.assertTrue(MODULE.is_relevant_candidate(
            'Precision pipetting in biology research.jpg', '', 'research-laboratory'))

    def test_all_published_covers_have_unique_reviewed_sources(self):
        path = PATH.parent.parent / 'src/data/journal/photography.json'
        self.assertEqual(MODULE.validate_catalog(json.loads(path.read_text())), 377)


if __name__ == '__main__':
    unittest.main()
