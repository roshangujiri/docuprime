public class Util {
    /**
     * @description   :   Matches a input string against the target regular expression
     * @param         :   String inputString, String targetRegex
     * @return        :   Boolean value
     */
    public static Boolean matchStringWithRegex(String inputString, String targetRegex) {
        Pattern customPattern = Pattern.compile(targetRegex);
        Matcher customMatcher = customPattern.matcher(inputString);
        return customMatcher.matches();
    }
}