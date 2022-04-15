@isTest
public class UtilTest {
    @isTest
    private static void testMatchStringWithRegexShouldMatchTheString() {
        String inputString = '2021-03-01 00:00:00';
        String targetRegex = '[0-9]{4}-[0-9]{2}-[0-9]{2} 00:00:00';
        Boolean result = Util.matchStringWithRegex(inputString, targetRegex);
        System.assertEquals(true, result, 'Input string doesn\'t match target Regex.');
    }

    @isTest
    private static void testMatchStringWithRegexShouldNotMatchTheString() {
        String inputString = '2021-03--01 00:00';
        String targetRegex = '[0-9]{4}-[0-9]{2}-[0-9]{2} 00:00:00';
        Boolean result = Util.matchStringWithRegex(inputString, targetRegex);
        System.assertEquals(false, result, 'Input string matches target Regex.');
    }
}