namespace.lookup('org.startpad.trie.test').defineOnce(function (ns) {
    var trieLib = namespace.lookup('org.startpad.trie');

    var mark = 0;

    function countNodes(node) {
        if (node._m === mark) {
            return 0;
        }
        var count = 0;
        for (var prop in node) {
            if (node.hasOwnProperty(prop) && typeof(node[prop]) == 'object') {
                count += countNodes(node[prop]);
            }
        }
        node._m = mark;
        return count + 1;
    }

    var tests = [
        {dict: "this is a test",
         wordCount: 4,
         words: ['this', 'is', 'a', 'test'],
         nonWords: ['t', 'te', 'tes'],
         nodeCount: 2},
        {dict: "them the",
         wordCount: 2,
         words: ['them', 'the'],
         nonWords: ['th', 'there'],
         nodeCount: 2},
        {dict: "the them th",
         wordCount: 3,
         words: ['the', 'them', 'th'],
         nonWords: ['t', 'they'],
         nodeCount: 3},
        {dict: "the them the they themselves",
         wordCount: 4,
         words: ['the', 'them', 'they', 'themselves'],
         nonWords: ['thems'],
         nodeCount: 3},
        {dict: "abcde abcfg cat",
         wordCount: 3,
         words: ['abcde', 'abcfg'],
         nonWords: ['abc', 'cats'],
         nodeCount: 2},
        {dict: "to to",
         wordCount: 1,
         words: ['to'],
         nonWords: ['t'],
         nodeCount: 1},
        {dict: "bat bats cat cats dog dogs fish fishing dogging",
         words: ['cat', 'bat', 'dog', 'fish', 'fishing', 'dogging'],
         wordCount: 9,
         nonWords: ['ing', 's', 'cating', 'doging'],
         pack: "bat1cat1dog2fish3;!s;!ging,s;!ing",
         nodeCount: 4},
        {dict: "tap taps top tops cap caps cop cops",
         words: ['cap', 'caps'],
         nonWords: ['c', 'ap'],
         nodeCount: 3,
         pack: "c1t1;ap1op1;!s"},
        {dict: "bing sing ding ring",
         words: ['bing', 'sing'],
         nonWords: ['b', 'ing'],
         nodeCount: 2,
         pack: "Aing;bA,dA,rA,sA"}
    ];

    ns.addTests = function (ts) {

        ts.addTest("toAlphaCode", function(ut) {
            var tests = [
                [0, 'A'], [1, 'B'], [2, 'C'], [25, 'Z'],
                [26, 'AA'], [27, 'AB'],
                [26 + 676, 'AAA']
            ];

            for (var i = 0; i < tests.length; i++) {
                var test = tests[i];
                ut.assertEq(trieLib.toAlphaCode(test[0]), test[1]);
            }
        });

        ts.addTest("Trie", function(ut) {
            var i, j;

            for (i = 0; i < tests.length; i++) {
                ut.trace(i);
                var test = tests[i];
                var trie = new trieLib.Trie(test.dict);
                trie.optimize();
                mark++;
                ut.assertEq(countNodes(trie.root), test.nodeCount, "node count");
                if (test.wordCount != undefined) {
                    ut.assertEq(trie.wordCount, test.wordCount);
                }
                for (j = 0; j < test.words.length; j++) {
                    ut.assert(trie.isWord(test.words[j]), test.words[j] + " is a word");
                }
                for (j = 0; j < test.nonWords.length; j++) {
                    ut.assert(!trie.isWord(test.nonWords[j]), test.nonWords[j] + " is not a word");
                }
            }
        });

        ts.addTest('trie.pack', function(ut) {
            var trie = new trieLib.Trie("aah aahed aahing aahs aal");
            ut.assertEq(trie.pack(), "aa1;h1l;!ed,ing,s");
        });

        ts.addTest('PackedTrie', function(ut) {
            var i, j;
            for (i = 0; i < tests.length; i++) {
                ut.trace(i);
                var test = tests[i];
                var trie = new trieLib.Trie(test.dict);
                var pack = trie.pack();
                if (test.pack) {
                    ut.assertEq(pack, test.pack);
                }
                console.log("pack: " + pack);
                ut.assertEq(pack.split(';').length, test.nodeCount, "node count");
                var ptrie = new trieLib.PackedTrie(pack);
                for (j = 0; j < test.words.length; j++) {
                    ut.assert(ptrie.isWord(test.words[j]), test.words[j] + " is a word");
                }
                for (j = 0; j < test.nonWords.length; j++) {
                    ut.assert(!ptrie.isWord(test.nonWords[j]), test.nonWords[j] + " is not a word");
                }
            }
        });

    };
});
