@isTest
private class PlaceholderValueWrapperTest {
    @isTest
    public static void testAdvanceEditorController() {
        User docupadUser = TestUtils.generateDocuPadUserForTest();
        System.runAs(docupadUser) {
            PlaceholderValueWrapper objPlaceholderValueWrapper = new PlaceholderValueWrapper('label', 'value');
            System.assertEquals('value', objPlaceholderValueWrapper.value, 'value matched');
        }
    }
}