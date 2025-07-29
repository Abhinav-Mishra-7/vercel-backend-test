const CPP_BOILERPLATE = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <queue>
#include <stack>
#include <unordered_map>
#include <unordered_set>
#include <list>
#include <algorithm>
#include <iomanip> // For setprecision
#include <climits> // For INT_MAX, INT_MIN, LONG_MIN, LONG_MAX

using namespace std;

// --- Standard Data Structures ---
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// --- Input Parsers ---
vector<int> parseVectorInt(string& line) {
    vector<int> nums;
    if (line.empty()) return nums;
    stringstream ss(line);
    int num;
    while(ss >> num) nums.push_back(num);
    return nums;
}

// NOTE: This basic parser cannot create cyclic or intersecting lists from stdin.
// Test cases for problems like 'hasCycle' or 'getIntersectionNode'
// must be designed to work with this limitation or validated differently.
ListNode* parseLinkedList(string& line) {
    if (line.empty()) return nullptr;
    vector<int> nodes = parseVectorInt(line);
    if (nodes.empty()) return nullptr;
    ListNode* head = new ListNode(nodes[0]);
    ListNode* current = head;
    for (size_t i = 1; i < nodes.size(); ++i) {
        current->next = new ListNode(nodes[i]);
        current = current->next;
    }
    return head;
}

TreeNode* parseTree(string& line) {
    if (line.empty() || line == "null") return nullptr;
    stringstream ss(line);
    string nodeStr;
    vector<string> nodes;
    while(ss >> nodeStr) nodes.push_back(nodeStr);
    
    if (nodes.empty() || nodes[0] == "null") return nullptr;

    TreeNode* root = new TreeNode(stoi(nodes[0]));
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (!q.empty() && i < nodes.size()) {
        TreeNode* current = q.front();
        q.pop();
        if (nodes[i] != "null") {
            current->left = new TreeNode(stoi(nodes[i]));
            q.push(current->left);
        }
        i++;
        if (i < nodes.size() && nodes[i] != "null") {
            current->right = new TreeNode(stoi(nodes[i]));
            q.push(current->right);
        }
        i++;
    }
    return root;
}

// --- Output Printers ---
void printVector(const vector<int>& vec) {
    for(size_t i = 0; i < vec.size(); ++i) {
        cout << vec[i] << (i == vec.size() - 1 ? "" : " ");
    }
    cout << endl;
}

void printLinkedList(ListNode* head) {
    if (!head) {
        cout << endl;
        return;
    }
    unordered_set<ListNode*> visited;
    while(head && visited.find(head) == visited.end()) {
        visited.insert(head);
        cout << head->val << (head->next && visited.find(head->next) == visited.end() ? " " : "");
        head = head->next;
    }
    cout << endl;
}

// The main harness logic must manually create the cycle if needed.
ListNode* parseLinkedList(string& line, int pos, vector<ListNode*>& all_nodes) {
    if (line.empty()) return nullptr;
    vector<int> node_vals = parseVectorInt(line);
    if (node_vals.empty()) return nullptr;
    
    ListNode* head = new ListNode(node_vals[0]);
    all_nodes.push_back(head);
    ListNode* current = head;

    for (size_t i = 1; i < node_vals.size(); ++i) {
        current->next = new ListNode(node_vals[i]);
        current = current->next;
        all_nodes.push_back(current);
    }
    
    if (pos != -1 && pos < all_nodes.size()) {
        current->next = all_nodes[pos];
    }
    
    return head;
}
`;

const JAVA_BOILERPLATE = `
import java.util.*;

class ListNode { int val; ListNode next; ListNode(int x) { val = x; } }
class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x) { val = x; } }

public class Main {
    // --- Input Parsers ---
    private static int[] parseIntArray(String line) {
        if (line == null || line.trim().isEmpty()) return new int[0];
        String[] parts = line.trim().split("\\\\s+");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            if (!parts[i].isEmpty()) {
                arr[i] = Integer.parseInt(parts[i]);
            }
        }
        return arr;
    }

    // NOTE: This basic parser can create cyclic or intersecting lists from stdin.
     private static ListNode parseLinkedList(String line, int pos) {
        if (line == null || line.trim().isEmpty()) return null;
        int[] nodeVals = parseIntArray(line);
        if (nodeVals.length == 0) return null;

        List<ListNode> allNodes = new ArrayList<>();
        ListNode head = new ListNode(nodeVals[0]);
        allNodes.add(head);
        ListNode current = head;
        
        for (int i = 1; i < nodeVals.length; i++) {
            current.next = new ListNode(nodeVals[i]);
            current = current.next;
            allNodes.add(current);
        }
        
        if (pos != -1 && pos < allNodes.size()) {
            current.next = allNodes.get(pos);
        }
        
        return head;
    }

    private static TreeNode parseTree(String line) {
        if (line == null || line.trim().isEmpty() || line.equals("null")) return null;
        String[] nodes = line.trim().split("\\\\s+");
        if (nodes.length == 0 || nodes[0].equals("null")) return null;

        TreeNode root = new TreeNode(Integer.parseInt(nodes[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        int i = 1;
        while (!queue.isEmpty() && i < nodes.length) {
            TreeNode current = queue.poll();
            if (!nodes[i].equals("null")) {
                current.left = new TreeNode(Integer.parseInt(nodes[i]));
                queue.add(current.left);
            }
            i++;
            if (i < nodes.length && !nodes[i].equals("null")) {
                current.right = new TreeNode(Integer.parseInt(nodes[i]));
                queue.add(current.right);
            }
            i++;
        }
        return root;
    }
`;

const JS_BOILERPLATE = `
function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}

function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
}

// --- Input Parsers for JS ---
// NOTE: This parser now handles cycle creation based on 'pos'.
function parseLinkedList(line, pos) {
    if (!line || line.trim() === '') return null;
    const nodeVals = line.trim().split(/\\s+/).map(Number);
    if (nodeVals.length === 0) return null;
    
    const allNodes = [];
    let head = new ListNode(nodeVals[0]);
    allNodes.push(head);
    let current = head;

    for (let i = 1; i < nodeVals.length; i++) {
        current.next = new ListNode(nodeVals[i]);
        current = current.next;
        allNodes.push(current);
    }
    
    if (pos !== -1 && pos < allNodes.length) {
        current.next = allNodes[pos];
    }
    
    return head;
}

function parseTree(line) {
    if (!line || line.trim() === 'null' || line.trim() === '') return null;
    const nodes = line.trim().split(/\\s+/);
    if (nodes.length === 0 || nodes[0] === 'null') return null;

    let root = new TreeNode(parseInt(nodes[0], 10));
    let queue = [root];
    let i = 1;
    while (queue.length > 0 && i < nodes.length) {
        let current = queue.shift();
        if (nodes[i] !== 'null') {
            current.left = new TreeNode(parseInt(nodes[i], 10));
            queue.push(current.left);
        }
        i++;
        if (i < nodes.length && nodes[i] !== 'null') {
            current.right = new TreeNode(parseInt(nodes[i], 10));
            queue.push(current.right);
        }
        i++;
    }
    return root;
}
`;

// Helper function to build a simple linear list parser for problems that don't need cycles
function buildSimpleCppLinkedListParser() {
    return `
ListNode* parseLinkedList(string& line) {
    if (line.empty()) return nullptr;
    vector<int> nodes = parseVectorInt(line);
    if (nodes.empty()) return nullptr;
    ListNode* head = new ListNode(nodes[0]);
    ListNode* current = head;
    for (size_t i = 1; i < nodes.size(); ++i) {
        current->next = new ListNode(nodes[i]);
        current = current->next;
    }
    return head;
}`;
}

function buildSimpleJavaLinkedListParser() {
    return `
    private static ListNode parseLinkedList(String line) {
        if (line == null || line.trim().isEmpty()) return null;
        int[] nodes = parseIntArray(line);
        if (nodes.length == 0) return null;
        ListNode head = new ListNode(nodes[0]);
        ListNode current = head;
        for (int i = 1; i < nodes.length; i++) {
            current.next = new ListNode(nodes[i]);
            current = current.next;
        }
        return head;
    }`;
}

function buildSimpleJsLinkedListParser() {
    return `
function parseLinkedList(line) {
    if (!line || line.trim() === '') return null;
    const nodes = line.trim().split(/\\s+/).map(Number);
    if (nodes.length === 0) return null;
    let head = new ListNode(nodes[0]);
    let current = head;
    for (let i = 1; i < nodes.length; i++) {
        current.next = new ListNode(nodes[i]);
        current = current.next;
    }
    return head;
}`;
}

function buildCppHarness(userCode, functionName) {
    const wrappedUserCode = `
class Solution {
public:
    ${userCode}
};
    `;
    let mainLogic = '';
    
    // --- Grouped by Signature for Simplicity ---

    // Signature: (vector<int>&) -> T
    const singleVectorIntFuncs = new Set(['maxProfit', 'containsDuplicate', 'longestConsecutive', 'trap', 'minCostClimbingStairs', 'rob', 'largestRectangleArea', 'containerWithMostWater', 'findMin', 'lengthOfLIS', 'maxSubArray', 'missingNumber']);
    const singleVectorVoidFuncs = new Set(['moveZeroes']);
    const singleVectorVectorFuncs = new Set(['productExceptSelf']);

    if (singleVectorIntFuncs.has(functionName)) {
        mainLogic = `
        int main() {
            string line;
            getline(cin, line);
            vector<int> nums = parseVectorInt(line);
            Solution sol;
            auto result = sol.${functionName}(nums);
            cout << result << endl;
            return 0;
        }`;
    } else if (functionName === 'containsDuplicate') { // Special case for bool
        mainLogic = `
        int main() {
            string line;
            getline(cin, line);
            vector<int> nums = parseVectorInt(line);
            Solution sol;
            bool result = sol.containsDuplicate(nums);
            cout << (result ? "true" : "false") << endl;
            return 0;
        }`;
    } else if (singleVectorVoidFuncs.has(functionName)) {
        mainLogic = `
        int main() {
            string line;
            getline(cin, line);
            vector<int> nums = parseVectorInt(line);
            Solution sol;
            sol.${functionName}(nums);
            printVector(nums);
            return 0;
        }`;
    } else if (singleVectorVectorFuncs.has(functionName)) {
        mainLogic = `
        int main() {
            string line;
            getline(cin, line);
            vector<int> nums = parseVectorInt(line);
            Solution sol;
            vector<int> result = sol.${functionName}(nums);
            printVector(result);
            return 0;
        }`;
    }
    // Signature: (int) -> T
    else if (functionName === 'climbStairs' || functionName === 'fib') {
        mainLogic = `
        int main() {
            int n;
            cin >> n;
            Solution sol;
            cout << sol.${functionName}(n) << endl;
            return 0;
        }`;
    } else if (functionName === 'divisorGame') {
         mainLogic = `
        int main() {
            int n;
            cin >> n;
            Solution sol;
            cout << (sol.divisorGame(n) ? "true" : "false") << endl;
            return 0;
        }`;
    }
    // Signature: (string, string) -> bool
    else if (functionName === 'isAnagram') {
        mainLogic = `
        int main() {
            string s, t;
            getline(cin, s);
            getline(cin, t);
            Solution sol;
            cout << (sol.isAnagram(s, t) ? "true" : "false") << endl;
            return 0;
        }`;
    }
    // Signature: (vector<int>&, int) -> T
    else if (functionName === 'twoSum') {
        mainLogic = `
        int main() {
            string line1;
            getline(cin, line1);
            vector<int> nums = parseVectorInt(line1);
            int val;
            cin >> val;
            Solution sol;
            vector<int> result = sol.twoSum(nums, val);
            printVector(result);
            return 0;
        }`;
    } else if (functionName === 'coinChange') {
        mainLogic = `
        int main() {
            string line1;
            getline(cin, line1);
            vector<int> nums = parseVectorInt(line1);
            int val;
            cin >> val;
            Solution sol;
            int result = sol.coinChange(nums, val);
            cout << result << endl;
            return 0;
        }`;
    }
    // Signature: (vector<int>&, vector<int>&) -> double
    else if (functionName === 'findMedianSortedArrays') {
        mainLogic = `
        int main() {
            string line1, line2;
            getline(cin, line1);
            getline(cin, line2);
            vector<int> nums1 = parseVectorInt(line1);
            vector<int> nums2 = parseVectorInt(line2);
            Solution sol;
            double result = sol.findMedianSortedArrays(nums1, nums2);
            cout << fixed << setprecision(5) << result << endl;
            return 0;
        }`;
    }
    // Signature: (ListNode*) -> T
    else if (functionName === 'reverseList' || functionName === 'oddEvenList') {
        mainLogic = `
        int main() {
            string line;
            getline(cin, line);
            ListNode* head = parseLinkedList(line);
            Solution sol;
            ListNode* result = sol.${functionName}(head);
            printLinkedList(result);
            return 0;
        }`;
    } else if (functionName === 'hasCycle') {
         mainLogic = `
        int main() {
            string line;
            getline(cin, line);
            int pos;
            cin >> pos;
            vector<ListNode*> all_nodes;
            ListNode* head = parseLinkedList(line, pos, all_nodes);
            Solution sol;
            cout << (sol.hasCycle(head) ? "true" : "false") << endl;
            return 0;
        }`;
    }
    // Signature: (ListNode*, ListNode*) -> ListNode*
    else if (functionName === 'mergeTwoLists' || functionName === 'addTwoNumbers' || functionName === 'getIntersectionNode') {
        mainLogic = `
        int main() {
            string line1, line2;
            getline(cin, line1);
            getline(cin, line2);
            ListNode* l1 = parseLinkedList(line1);
            ListNode* l2 = parseLinkedList(line2);
            Solution sol;
            ListNode* result = sol.${functionName}(l1, l2);
            printLinkedList(result);
            return 0;
        }`;
    }
    // Signature: (ListNode*, int) -> ListNode*
    else if (functionName === 'removeNthFromEnd' || functionName === 'reverseKGroup') {
        mainLogic = `
        int main() {
            string line;
            getline(cin, line);
            int n;
            cin >> n;
            ListNode* head = parseLinkedList(line);
            Solution sol;
            ListNode* result = sol.${functionName}(head, n);
            printLinkedList(result);
            return 0;
        }`;
    }
    // Signature: (TreeNode*) -> T
    else if (functionName === 'maxDepth' || functionName === 'maxPathSum' || functionName === 'goodNodes' || functionName === 'diameterOfBinaryTree') {
        mainLogic = `
        int main() {
            string line;
            getline(cin, line);
            TreeNode* root = parseTree(line);
            Solution sol;
            auto result = sol.${functionName}(root);
            cout << result << endl;
            return 0;
        }`;
    } else if (functionName === 'isValidBST' || functionName === 'isSymmetric') {
        mainLogic = `
        int main() {
            string line;
            getline(cin, line);
            TreeNode* root = parseTree(line);
            Solution sol;
            cout << (sol.${functionName}(root) ? "true" : "false") << endl;
            return 0;
        }`;
    } else if (functionName === 'rightSideView') {
         mainLogic = `
        int main() {
            string line;
            getline(cin, line);
            TreeNode* root = parseTree(line);
            Solution sol;
            vector<int> result = sol.rightSideView(root);
            printVector(result);
            return 0;
        }`;
    }
    // Signature: (TreeNode*, TreeNode*) -> bool
    else if (functionName === 'isSameTree') {
        mainLogic = `
        int main() {
            string line1, line2;
            getline(cin, line1);
            getline(cin, line2);
            TreeNode* p = parseTree(line1);
            TreeNode* q = parseTree(line2);
            Solution sol;
            cout << (sol.isSameTree(p, q) ? "true" : "false") << endl;
            return 0;
        }`;
    }
    // Signature: (TreeNode*, int) -> int
    else if (functionName === 'kthSmallest') {
        mainLogic = `
        int main() {
            string line;
            getline(cin, line);
            int k;
            cin >> k;
            TreeNode* root = parseTree(line);
            Solution sol;
            cout << sol.kthSmallest(root, k) << endl;
            return 0;
        }`;
    }
    // Signature: (vector<vector<char>>&) -> int
    else if (functionName === 'numIslands') {
        mainLogic = `
        int main() {
            string first_line;
            getline(cin, first_line);
            stringstream ss(first_line);
            int m, n;
            ss >> m >> n;
            vector<vector<char>> grid(m, vector<char>(n));
            for (int i = 0; i < m; ++i) {
                string row_line;
                getline(cin, row_line);
                stringstream row_ss(row_line);
                for (int j = 0; j < n; ++j) {
                    row_ss >> grid[i][j];
                }
            }
            Solution sol;
            cout << sol.numIslands(grid) << endl;
            return 0;
        }`;
    }
    // Signature: (vector<vector<int>>&) -> T
    else if (functionName === 'findCenter') {
         mainLogic = `
        int main() {
            string line;
            vector<vector<int>> edges;
            int n; // Assuming n might be on the first line, but the function doesn't need it.
            cin >> n;
            cin.ignore(); 
            while(getline(cin, line) && !line.empty()) {
                edges.push_back(parseVectorInt(line));
            }
            Solution sol;
            cout << sol.findCenter(edges) << endl;
            return 0;
        }`;
    } else if (functionName === 'findCircleNum') {
        mainLogic = `
        int main() {
            int n;
            cin >> n;
            vector<vector<int>> grid(n, vector<int>(n));
            for (int i = 0; i < n; ++i) {
                for (int j = 0; j < n; ++j) {
                    cin >> grid[i][j];
                }
            }
            Solution sol;
            cout << sol.findCircleNum(grid) << endl;
            return 0;
        }`;
    }
    // Signature: (int, int) -> int
    else if (functionName === 'uniquePaths') {
        mainLogic = `
        int main() {
            int m, n;
            cin >> m >> n;
            Solution sol;
            cout << sol.uniquePaths(m, n) << endl;
            return 0;
        }`;
    }
    // Signature: (int, vector<vector<int>>&) -> T
    else if (functionName === 'canFinish') {
        mainLogic = `
        int main() {
            int numCourses, prereq_count;
            cin >> numCourses >> prereq_count;
            vector<vector<int>> prerequisites(prereq_count, vector<int>(2));
            for (int i = 0; i < prereq_count; ++i) {
                cin >> prerequisites[i][0] >> prerequisites[i][1];
            }
            Solution sol;
            cout << (sol.canFinish(numCourses, prerequisites) ? "true" : "false") << endl;
            return 0;
        }`;
    } else if (functionName === 'findOrder') {
         mainLogic = `
        int main() {
            int numCourses, prereq_count;
            cin >> numCourses >> prereq_count;
            vector<vector<int>> prerequisites(prereq_count, vector<int>(2));
            for (int i = 0; i < prereq_count; ++i) {
                cin >> prerequisites[i][0] >> prerequisites[i][1];
            }
            Solution sol;
            vector<int> result = sol.findOrder(numCourses, prerequisites);
            printVector(result);
            return 0;
        }`;
    } else if (functionName === 'findTownJudge') {
         mainLogic = `
        int main() {
            int n, trust_count;
            cin >> n >> trust_count;
            vector<vector<int>> trust(trust_count, vector<int>(2));
            for (int i = 0; i < trust_count; ++i) {
                cin >> trust[i][0] >> trust[i][1];
            }
            Solution sol;
            cout << sol.findTownJudge(n, trust) << endl;
            return 0;
        }`;
    }
     // Signature: (string, vector<string>&) -> bool
    else if (functionName === 'wordBreak') {
        mainLogic = `
        int main() {
            string s;
            getline(cin, s);
            int n;
            cin >> n;
            cin.ignore();
            vector<string> wordDict;
            string word;
            for(int i = 0; i < n; ++i) {
                getline(cin, word);
                wordDict.push_back(word);
            }
            Solution sol;
            cout << (sol.wordBreak(s, wordDict) ? "true" : "false") << endl;
            return 0;
        }`;
    }
    // Signature: (vector<vector<int>>&, int, int) -> int (Network Delay Time)
    else if (functionName === 'networkDelayTime') {
        mainLogic = `
        int main() {
            int n, k, times_count;
            cin >> n >> k >> times_count;
            vector<vector<int>> times(times_count, vector<int>(3));
            for(int i = 0; i < times_count; ++i) {
                cin >> times[i][0] >> times[i][1] >> times[i][2];
            }
            Solution sol;
            cout << sol.networkDelayTime(times, n, k) << endl;
            return 0;
        }`;
    }
    else {
        throw new Error(`C++ harness for function '${functionName}' is not implemented.`);
    }
    return `${CPP_BOILERPLATE}\n${wrappedUserCode}\n${mainLogic}`;
}

function buildJavaHarness(userCode, functionName) {
    const wrappedUserCode = `    static class Solution { ${userCode} }`;
    let mainLogic = '';
    
    // --- Boilerplate parts for main method ---
    const scannerInit = `public static void main(String[] args) {\n            Scanner sc = new Scanner(System.in);`;
    const scannerClose = `sc.close();\n        }`;

    // --- Logic goes here ---
     if (functionName === 'hasCycle') {
        mainLogic = `
            String line = sc.nextLine();
            int pos = sc.nextInt();
            ListNode head = parseLinkedList(line, pos);
            Solution sol = new Solution();
            System.out.println(sol.hasCycle(head));
        `;
    }
    else if (functionName === 'isAnagram') {
        mainLogic = `
            String s = sc.nextLine();
            String t = sc.nextLine();
            Solution sol = new Solution();
            System.out.println(sol.isAnagram(s, t));
        `;
    } else if (['maxProfit', 'longestConsecutive', 'trap', 'minCostClimbingStairs', 'rob', 'largestRectangleArea', 'containerWithMostWater', 'findMin', 'lengthOfLIS', 'maxSubArray', 'missingNumber'].includes(functionName)) {
        mainLogic = `
            String line = sc.hasNextLine() ? sc.nextLine() : "";
            int[] nums = parseIntArray(line);
            Solution sol = new Solution();
            System.out.println(sol.${functionName}(nums));
        `;
    } else if(functionName === 'containsDuplicate'){
         mainLogic = `
            String line = sc.hasNextLine() ? sc.nextLine() : "";
            int[] nums = parseIntArray(line);
            Solution sol = new Solution();
            System.out.println(sol.containsDuplicate(nums));
        `;
    } else if (['climbStairs', 'fib'].includes(functionName)) {
        mainLogic = `
            int n = sc.nextInt();
            Solution sol = new Solution();
            System.out.println(sol.${functionName}(n));
        `;
    } else if (functionName === 'divisorGame') {
        mainLogic = `
            int n = sc.nextInt();
            Solution sol = new Solution();
            System.out.println(sol.divisorGame(n));
        `;
    } else if (functionName === 'moveZeroes') { // In-place modification
        mainLogic = `
            String line = sc.hasNextLine() ? sc.nextLine() : "";
            int[] nums = parseIntArray(line);
            Solution sol = new Solution();
            sol.moveZeroes(nums);
            for (int i = 0; i < nums.length; i++) {
                System.out.print(nums[i] + (i == nums.length - 1 ? "" : " "));
            }
            System.out.println();
        `;
    } else if (['twoSum', 'productExceptSelf', 'findOrder'].includes(functionName)) { // Returns int[]
         mainLogic = `
            ${functionName === 'findOrder' ? 'int numCourses = sc.nextInt(); int p_count = sc.nextInt(); int[][] prereqs = new int[p_count][2]; for (int i = 0; i < p_count; i++) { prereqs[i][0] = sc.nextInt(); prereqs[i][1] = sc.nextInt(); }' 
            : `String line = sc.hasNextLine() ? sc.nextLine() : \"\";
               int[] nums = parseIntArray(line);
               ${functionName === 'twoSum' ? 'int target = sc.nextInt();' : ''}`
            }
            Solution sol = new Solution();
            int[] result = sol.${functionName}(${functionName === 'findOrder' ? 'numCourses, prereqs' : 'nums' + (functionName === 'twoSum' ? ', target' : '')});
            if (result != null) {
                for (int i = 0; i < result.length; i++) {
                    System.out.print(result[i] + (i == result.length - 1 ? "" : " "));
                }
            }
            System.out.println();
        `;
    } else if (functionName === 'coinChange') {
        mainLogic = `
            String line = sc.hasNextLine() ? sc.nextLine() : "";
            int[] coins = parseIntArray(line);
            int amount = sc.nextInt();
            Solution sol = new Solution();
            System.out.println(sol.coinChange(coins, amount));
        `;
    } else if (functionName === 'findMedianSortedArrays') {
        mainLogic = `
            String line1 = sc.hasNextLine() ? sc.nextLine() : "";
            String line2 = sc.hasNextLine() ? sc.nextLine() : "";
            int[] nums1 = parseIntArray(line1);
            int[] nums2 = parseIntArray(line2);
            Solution sol = new Solution();
            System.out.printf("%.5f%n", sol.findMedianSortedArrays(nums1, nums2));
        `;
    } else if (['reverseList', 'removeNthFromEnd', 'reverseKGroup', 'oddEvenList'].includes(functionName)) {
        mainLogic = `
            String line = sc.hasNextLine() ? sc.nextLine() : "";
            ListNode head = parseLinkedList(line);
            ${functionName === 'removeNthFromEnd' || functionName === 'reverseKGroup' ? 'int n = sc.nextInt();' : ''}
            Solution sol = new Solution();
            ListNode result = sol.${functionName}(head${functionName === 'removeNthFromEnd' || functionName === 'reverseKGroup' ? ', n' : ''});
            while(result != null) {
                System.out.print(result.val + (result.next != null ? " " : ""));
                result = result.next;
            }
            System.out.println();
        `;
    } else if (['mergeTwoLists', 'addTwoNumbers', 'getIntersectionNode'].includes(functionName)) {
         mainLogic = `
            String line1 = sc.hasNextLine() ? sc.nextLine() : "";
            String line2 = sc.hasNextLine() ? sc.nextLine() : "";
            ListNode l1 = parseLinkedList(line1);
            ListNode l2 = parseLinkedList(line2);
            Solution sol = new Solution();
            ListNode result = sol.${functionName}(l1, l2);
            while(result != null) {
                System.out.print(result.val + (result.next != null ? " " : ""));
                result = result.next;
            }
            System.out.println();
        `;
    } else if (['maxDepth', 'isValidBST', 'isSymmetric', 'maxPathSum', 'goodNodes', 'diameterOfBinaryTree'].includes(functionName)) {
        mainLogic = `
            String line = sc.hasNextLine() ? sc.nextLine() : "";
            TreeNode root = parseTree(line);
            Solution sol = new Solution();
            System.out.println(sol.${functionName}(root));
        `;
    } else if (functionName === 'rightSideView') {
        mainLogic = `
            String line = sc.hasNextLine() ? sc.nextLine() : "";
            TreeNode root = parseTree(line);
            Solution sol = new Solution();
            List<Integer> result = sol.rightSideView(root);
            for (int i = 0; i < result.size(); i++) {
                System.out.print(result.get(i) + (i == result.size() - 1 ? "" : " "));
            }
            System.out.println();
        `;
    } else if (functionName === 'isSameTree') {
        mainLogic = `
            String line1 = sc.hasNextLine() ? sc.nextLine() : "";
            String line2 = sc.hasNextLine() ? sc.nextLine() : "";
            TreeNode p = parseTree(line1);
            TreeNode q = parseTree(line2);
            Solution sol = new Solution();
            System.out.println(sol.isSameTree(p, q));
        `;
    } else if (functionName === 'kthSmallest') {
        mainLogic = `
            String line = sc.hasNextLine() ? sc.nextLine() : "";
            TreeNode root = parseTree(line);
            int k = sc.nextInt();
            Solution sol = new Solution();
            System.out.println(sol.kthSmallest(root, k));
        `;
    } else if (functionName === 'uniquePaths') {
        mainLogic = `
            int m = sc.nextInt();
            int n = sc.nextInt();
            Solution sol = new Solution();
            System.out.println(sol.uniquePaths(m, n));
        `;
    } else if (functionName === 'numIslands') {
        mainLogic = `
            int m = sc.nextInt();
            int n = sc.nextInt();
            sc.nextLine(); // consume newline
            char[][] grid = new char[m][n];
            for(int i = 0; i < m; i++) {
                String row = sc.nextLine();
                String[] parts = row.trim().split("\\\\s+");
                for(int j = 0; j < n; j++) {
                    grid[i][j] = parts[j].charAt(0);
                }
            }
            Solution sol = new Solution();
            System.out.println(sol.numIslands(grid));
        `;
    } else if (functionName === 'findCircleNum') {
        mainLogic = `
            int n = sc.nextInt();
            int[][] grid = new int[n][n];
            for(int i = 0; i < n; i++) {
                for(int j = 0; j < n; j++) {
                    grid[i][j] = sc.nextInt();
                }
            }
            Solution sol = new Solution();
            System.out.println(sol.findCircleNum(grid));
        `;
    } else if (functionName === 'canFinish') {
         mainLogic = `
            int numCourses = sc.nextInt();
            int p_count = sc.nextInt();
            int[][] prereqs = new int[p_count][2];
            for (int i = 0; i < p_count; i++) {
                prereqs[i][0] = sc.nextInt();
                prereqs[i][1] = sc.nextInt();
            }
            Solution sol = new Solution();
            System.out.println(sol.canFinish(numCourses, prereqs));
        `;
    } else if (functionName === 'findTownJudge' || functionName === 'findCenter') {
        mainLogic = `
            int n = sc.nextInt();
            sc.nextLine(); // consume newline
            List<int[]> edgesList = new ArrayList<>();
            while(sc.hasNextLine()){
                String line = sc.nextLine();
                if(line.trim().isEmpty()) break;
                edgesList.add(parseIntArray(line));
            }
            int[][] edges = new int[edgesList.size()][2];
             for (int i = 0; i < edgesList.size(); i++) {
                edges[i] = edgesList.get(i);
            }
            Solution sol = new Solution();
            System.out.println(sol.${functionName}(${functionName == 'findTownJudge' ? 'n, edges' : 'edges'}));
        `;
    } else if (functionName === 'networkDelayTime') {
        mainLogic = `
            int n = sc.nextInt();
            int k = sc.nextInt();
            int times_count = sc.nextInt();
            int[][] times = new int[times_count][3];
            for(int i=0; i<times_count; i++){
                times[i][0] = sc.nextInt();
                times[i][1] = sc.nextInt();
                times[i][2] = sc.nextInt();
            }
            Solution sol = new Solution();
            System.out.println(sol.networkDelayTime(times, n, k));
        `;
    } else if (functionName === 'wordBreak') {
        mainLogic = `
            String s = sc.nextLine();
            int n = sc.nextInt();
            sc.nextLine(); // consume newline
            List<String> wordDict = new ArrayList<>();
            for(int i=0; i<n; i++){
                wordDict.add(sc.nextLine());
            }
            Solution sol = new Solution();
            System.out.println(sol.wordBreak(s, wordDict));
        `;
    }
    else {
        throw new Error(`Java harness for function '${functionName}' is not implemented.`);
    }

    return `${JAVA_BOILERPLATE}\n${wrappedUserCode}\n${scannerInit}\n${mainLogic}\n${scannerClose}\n}`;
}

function buildJsHarness(userCode, functionName) {
    const mainLogic = `

    function printLinkedList(head) {
        if (!head) {
            console.log("");
            return;
        }
        const visited = new Set();
        const parts = [];
        let curr = head;
        while(curr && !visited.has(curr)) {
            visited.add(curr);
            parts.push(curr.val);
            curr = curr.next;
        }
        console.log(parts.join(' '));
    }

    function run(input) {
        const lines = input.trim().split('\\n');
        
        // --- Grouped by Signature for Simplicity ---

        // Signature: (string, string) -> bool
        if ("${functionName}" === "hasCycle") {
            const listLine = lines[0] || "";
            const pos = lines.length > 1 ? Number(lines[1]) : -1;
            const head = parseLinkedList(listLine, pos);
            const result = ${functionName}(head);
            console.log(result);
        }
        else if ("${functionName}" === "isAnagram") {
            const result = ${functionName}(lines[0] || "", lines[1] || "");
            console.log(result);
        }
        // Signature: (vector<int>&) -> T
        else if (["maxProfit", "longestConsecutive", "trap", "minCostClimbingStairs", "rob", "containsDuplicate", "largestRectangleArea", "containerWithMostWater", "findMin", "lengthOfLIS", "maxSubArray", "missingNumber"].includes("${functionName}")) {
            const nums = lines[0] ? lines[0].trim().split(/\\s+/).map(Number) : [];
            const result = ${functionName}(nums);
            console.log(result);
        }
        // Signature: (vector<int>&) -> void
        else if ("${functionName}" === "moveZeroes") {
            const nums = lines[0] ? lines[0].trim().split(/\\s+/).map(Number) : [];
            ${functionName}(nums); // In-place
            console.log(nums.join(' '));
        }
        // Signature: (vector<int>&) -> vector<int>
        else if (["productExceptSelf", "rightSideView"].includes("${functionName}")) {
            let result;
            if ("${functionName}" === "rightSideView") {
                const root = parseTree(lines[0]);
                result = ${functionName}(root);
            } else {
                 const nums = lines[0] ? lines[0].trim().split(/\\s+/).map(Number) : [];
                 result = ${functionName}(nums);
            }
            console.log(result.join(' '));
        }
        // Signature: (vector<int>&, int) -> T
        else if (["twoSum", "coinChange"].includes("${functionName}")) {
            const nums = lines[0] ? lines[0].trim().split(/\\s+/).map(Number) : [];
            const target = Number(lines[1]);
            const result = ${functionName}(nums, target);
            if(Array.isArray(result)) {
                console.log(result.join(' '));
            } else {
                console.log(result);
            }
        }
         // Signature: (int) -> T
        else if (["climbStairs", "fib", "divisorGame"].includes("${functionName}")) {
            const n = Number(lines[0]);
            const result = ${functionName}(n);
            console.log(result);
        }
        // Signature: (int, int) -> int
        else if ("${functionName}" === "uniquePaths") {
            const [m, n] = lines[0].trim().split(/\\s+/).map(Number);
            console.log(${functionName}(m, n));
        }
        // Signature: (vector<int>&, vector<int>&) -> double
        else if ("${functionName}" === "findMedianSortedArrays") {
            const nums1 = lines[0] ? lines[0].trim().split(/\\s+/).map(Number) : [];
            const nums2 = lines.length > 1 && lines[1] ? lines[1].trim().split(/\\s+/).map(Number) : [];
            const result = ${functionName}(nums1, nums2);
            console.log(result.toFixed(5));
        }
        // Signature: (ListNode*) -> T
        else if (["reverseList", "maxDepth", "isValidBST", "oddEvenList", "hasCycle", "maxPathSum", "goodNodes", "isSymmetric", "diameterOfBinaryTree"].includes("${functionName}")) {
            const headOrRoot = ["reverseList", "oddEvenList", "hasCycle"].includes("${functionName}") ? parseLinkedList(lines[0]) : parseTree(lines[0]);
            const result = ${functionName}(headOrRoot);
            if (typeof result === 'object' && result !== null && result.hasOwnProperty('val')) { // is a ListNode
                 let str = [];
                 let curr = result;
                 while(curr) { str.push(curr.val); curr = curr.next; }
                 console.log(str.join(' '));
            } else {
                 console.log(result);
            }
        }
        // Signature: (ListNode*, ListNode*) -> T
        else if (["mergeTwoLists", "addTwoNumbers", "getIntersectionNode"].includes("${functionName}")) {
            const l1 = parseLinkedList(lines[0]);
            const l2 = parseLinkedList(lines[1] || "");
            const result = ${functionName}(l1, l2);
            let str = [];
            let curr = result;
            while(curr) { str.push(curr.val); curr = curr.next; }
            console.log(str.join(' '));
        }
        // Signature: (ListNode*, int) -> ListNode*
        else if (["removeNthFromEnd", "reverseKGroup"].includes("${functionName}")) {
            const head = parseLinkedList(lines[0]);
            const n = Number(lines[1]);
            const result = ${functionName}(head, n);
            let str = [];
            let curr = result;
            while(curr) { str.push(curr.val); curr = curr.next; }
            console.log(str.join(' '));
        }
        // Signature: (TreeNode*, TreeNode*) -> bool
        else if ("${functionName}" === "isSameTree") {
            const p = parseTree(lines[0]);
            const q = parseTree(lines[1] || "");
            console.log(${functionName}(p, q));
        }
        // Signature: (TreeNode*, int) -> int
        else if ("${functionName}" === "kthSmallest") {
            const root = parseTree(lines[0]);
            const k = Number(lines[1]);
            console.log(${functionName}(root, k));
        }
        // Signature: (vector<vector<...>>&) -> T
        else if (["numIslands", "findCircleNum", "findCenter"].includes("${functionName}")) {
            const [n, m] = lines[0].trim().split(/\\s+/).map(Number);
            const grid = [];
            const end = "${functionName}" === 'findCenter' ? n : n + 1; // edges.length is n-1 for findCenter
            for (let i = 1; i < end; i++) {
                grid.push(lines[i].trim().split(/\\s+/));
            }
            if ("${functionName}" === 'findCircleNum') {
                 // For findCircleNum, the first line is just 'n'
                const grid_n = Number(lines[0]);
                const matrix = [];
                for(let i=1; i <= grid_n; i++){
                    matrix.push(lines[i].trim().split(/\\s+/).map(Number));
                }
                 console.log(${functionName}(matrix));
            } else {
                 console.log(${functionName}(grid));
            }
        }
        // Signature: (int, vector<vector<int>>&) -> T
        else if (["canFinish", "findOrder", "findTownJudge"].includes("${functionName}")) {
            const [num, count] = lines[0].trim().split(/\\s+/).map(Number);
            const prerequisites = [];
            for(let i=1; i < 1 + count; i++) {
                prerequisites.push(lines[i].trim().split(/\\s+/).map(Number));
            }
            const result = ${functionName}(num, prerequisites);
             if(Array.isArray(result)) {
                console.log(result.join(' '));
            } else {
                console.log(result);
            }
        }
        // Signature: (string, vector<string>&) -> bool
        else if ("${functionName}" === "wordBreak") {
            const s = lines[0];
            const wordCount = Number(lines[1]);
            const wordDict = lines.slice(2, 2 + wordCount);
            console.log(${functionName}(s, wordDict));
        }
        // Signature: (vector<vector<int>>&, int, int) -> int (Network Delay Time)
        else if ("${functionName}" === "networkDelayTime") {
            const [n, k, times_count] = lines[0].trim().split(/\\s+/).map(Number);
            const times = [];
            for (let i = 1; i <= times_count; i++) {
                times.push(lines[i].trim().split(/\\s+/).map(Number));
            }
            console.log(${functionName}(times, n, k));
        }
        else {
            throw new Error(\`JS harness for function '\${"${functionName}"}' is not implemented.\`);
        }
    }

    process.stdin.resume();
    process.stdin.setEncoding('utf-8');
    let stdin_input = '';
    process.stdin.on('data', (input) => (stdin_input += input));
    process.stdin.on('end', () => run(stdin_input));
    `;

    return `${JS_BOILERPLATE}\n${userCode}\n${mainLogic}`;
}


function buildHarness(language, userCode, functionName, problemTag) {    
    if (language === 'cpp') {
        return buildCppHarness(userCode, functionName); 
    }
    if (language === 'java') {
        return buildJavaHarness(userCode, functionName);
    }
    if (language === 'javascript') {
        return buildJsHarness(userCode, functionName);
    }
    
    throw new Error(`Harness generation for language '${language}' is not supported.`);
}

module.exports = { buildHarness };




// const CPP_BOILERPLATE = `
// #include <iostream>
// #include <vector>
// #include <string>
// #include <sstream>
// #include <queue>
// #include <stack>
// #include <unordered_map>
// #include <unordered_set>
// #include <algorithm>
// #include <iomanip> // For setprecision
// #include <climits> // For INT_MAX, INT_MIN, LONG_MIN, LONG_MAX

// using namespace std;

// // --- Standard Data Structures ---
// struct ListNode {
//     int val;
//     ListNode *next;
//     ListNode() : val(0), next(nullptr) {}
//     ListNode(int x) : val(x), next(nullptr) {}
//     ListNode(int x, ListNode *next) : val(x), next(next) {}
// };

// struct TreeNode {
//     int val;
//     TreeNode *left;
//     TreeNode *right;
//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
// };

// // --- Input Parsers ---
// vector<int> parseVectorInt(string& line) {
//     vector<int> nums;
//     if (line.empty()) return nums;
//     stringstream ss(line);
//     int num;
//     while(ss >> num) nums.push_back(num);
//     return nums;
// }

// ListNode* parseLinkedList(string& line) {
//     if (line.empty()) return nullptr;
//     vector<int> nodes = parseVectorInt(line);
//     if (nodes.empty()) return nullptr;
//     ListNode* head = new ListNode(nodes[0]);
//     ListNode* current = head;
//     for (size_t i = 1; i < nodes.size(); ++i) {
//         current->next = new ListNode(nodes[i]);
//         current = current->next;
//     }
//     return head;
// }

// TreeNode* parseTree(string& line) {
//     if (line.empty() || line == "null") return nullptr;
//     stringstream ss(line);
//     string nodeStr;
//     vector<string> nodes;
//     while(ss >> nodeStr) nodes.push_back(nodeStr);
    
//     if (nodes.empty() || nodes[0] == "null") return nullptr;

//     TreeNode* root = new TreeNode(stoi(nodes[0]));
//     queue<TreeNode*> q;
//     q.push(root);
//     int i = 1;
//     while (!q.empty() && i < nodes.size()) {
//         TreeNode* current = q.front();
//         q.pop();
//         if (nodes[i] != "null") {
//             current->left = new TreeNode(stoi(nodes[i]));
//             q.push(current->left);
//         }
//         i++;
//         if (i < nodes.size() && nodes[i] != "null") {
//             current->right = new TreeNode(stoi(nodes[i]));
//             q.push(current->right);
//         }
//         i++;
//     }
//     return root;
// }

// // --- Output Printers ---
// void printVector(const vector<int>& vec) {
//     for(size_t i = 0; i < vec.size(); ++i) {
//         cout << vec[i] << (i == vec.size() - 1 ? "" : " ");
//     }
//     cout << endl;
// }

// void printLinkedList(ListNode* head) {
//     while(head) {
//         cout << head->val << (head->next ? " " : "");
//         head = head->next;
//     }
//     cout << endl;
// }
// `;

// const JAVA_BOILERPLATE = `
// import java.util.*;

// class ListNode { int val; ListNode next; ListNode(int x) { val = x; } }
// class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x) { val = x; } }

// public class Main {
//     // --- Input Parsers ---
//     private static int[] parseIntArray(String line) {
//         if (line == null || line.trim().isEmpty()) return new int[0];
//         String[] parts = line.trim().split("\\\\s+");
//         int[] arr = new int[parts.length];
//         for (int i = 0; i < parts.length; i++) {
//             if (!parts[i].isEmpty()) {
//                 arr[i] = Integer.parseInt(parts[i]);
//             }
//         }
//         return arr;
//     }

//     private static ListNode parseLinkedList(String line) {
//         if (line == null || line.trim().isEmpty()) return null;
//         int[] nodes = parseIntArray(line);
//         if (nodes.length == 0) return null;
//         ListNode head = new ListNode(nodes[0]);
//         ListNode current = head;
//         for (int i = 1; i < nodes.length; i++) {
//             current.next = new ListNode(nodes[i]);
//             current = current.next;
//         }
//         return head;
//     }

//     private static TreeNode parseTree(String line) {
//         if (line == null || line.trim().isEmpty() || line.equals("null")) return null;
//         String[] nodes = line.trim().split("\\\\s+");
//         if (nodes.length == 0 || nodes[0].equals("null")) return null;

//         TreeNode root = new TreeNode(Integer.parseInt(nodes[0]));
//         Queue<TreeNode> queue = new LinkedList<>();
//         queue.add(root);
//         int i = 1;
//         while (!queue.isEmpty() && i < nodes.length) {
//             TreeNode current = queue.poll();
//             if (!nodes[i].equals("null")) {
//                 current.left = new TreeNode(Integer.parseInt(nodes[i]));
//                 queue.add(current.left);
//             }
//             i++;
//             if (i < nodes.length && !nodes[i].equals("null")) {
//                 current.right = new TreeNode(Integer.parseInt(nodes[i]));
//                 queue.add(current.right);
//             }
//             i++;
//         }
//         return root;
//     }
// `;

// const JS_BOILERPLATE = `
// function ListNode(val, next) {
//     this.val = (val===undefined ? 0 : val)
//     this.next = (next===undefined ? null : next)
// }

// function TreeNode(val, left, right) {
//     this.val = (val===undefined ? 0 : val)
//     this.left = (left===undefined ? null : left)
//     this.right = (right===undefined ? null : right)
// }

// // --- Input Parsers for JS ---
// function parseLinkedList(line) {
//     if (!line || line.trim() === '') return null;
//     const nodes = line.trim().split(/\\s+/).map(Number);
//     if (nodes.length === 0) return null;
//     let head = new ListNode(nodes[0]);
//     let current = head;
//     for (let i = 1; i < nodes.length; i++) {
//         current.next = new ListNode(nodes[i]);
//         current = current.next;
//     }
//     return head;
// }

// function parseTree(line) {
//     if (!line || line.trim() === 'null' || line.trim() === '') return null;
//     const nodes = line.trim().split(/\\s+/);
//     if (nodes.length === 0 || nodes[0] === 'null') return null;

//     let root = new TreeNode(parseInt(nodes[0], 10));
//     let queue = [root];
//     let i = 1;
//     while (queue.length > 0 && i < nodes.length) {
//         let current = queue.shift();
//         if (nodes[i] !== 'null') {
//             current.left = new TreeNode(parseInt(nodes[i], 10));
//             queue.push(current.left);
//         }
//         i++;
//         if (i < nodes.length && nodes[i] !== 'null') {
//             current.right = new TreeNode(parseInt(nodes[i], 10));
//             queue.push(current.right);
//         }
//         i++;
//     }
//     return root;
// }
// `;

// function buildCppHarness(userCode, functionName) {
//     const wrappedUserCode = `
// class Solution {
// public:
//     ${userCode}
// };
//     `;
//     let mainLogic = '';
    
//     // --- Grouped by Signature for Simplicity ---

//     // Signature: (vector<int>&) -> T
//     const singleVectorFuncs = new Set(['maxProfit', 'containsDuplicate', 'productExceptSelf', 'longestConsecutive', 'trap', 'moveZeroes', 'minCostClimbingStairs', 'rob']);
//     if (singleVectorFuncs.has(functionName)) {
//         let outputType = 'int';
//         if (functionName === 'containsDuplicate') outputType = 'bool';
//         if (functionName === 'productExceptSelf' || functionName === 'moveZeroes') outputType = 'vector';
        
//         if (outputType === 'vector') {
//              mainLogic = `
//             int main() {
//                 string line;
//                 getline(cin, line);
//                 vector<int> nums = parseVectorInt(line);
//                 Solution sol;
//                 if (string("${functionName}") == "moveZeroes") {
//                     sol.moveZeroes(nums);
//                     printVector(nums);
//                 } else {
//                     vector<int> result = sol.productExceptSelf(nums);
//                     printVector(result);
//                 }
//                 return 0;
//             }`;
//         } else {
//             mainLogic = `
//             int main() {
//                 string line;
//                 getline(cin, line);
//                 vector<int> nums = parseVectorInt(line);
//                 Solution sol;
//                 auto result = sol.${functionName}(nums);
//                 cout << ${outputType === 'bool' ? '(result ? "true" : "false")' : 'result'} << endl;
//                 return 0;
//             }`;
//         }
//     }
//     // Signature: (int) -> T
//     else if (functionName === 'climbStairs') {
//         mainLogic = `
//         int main() {
//             int n;
//             cin >> n;
//             Solution sol;
//             cout << sol.climbStairs(n) << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (string, string) -> bool
//     else if (functionName === 'isAnagram') {
//         mainLogic = `
//         int main() {
//             string s, t;
//             getline(cin, s);
//             getline(cin, t);
//             Solution sol;
//             cout << (sol.isAnagram(s, t) ? "true" : "false") << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (vector<int>&, int) -> T
//     else if (functionName === 'twoSum' || functionName === 'coinChange') {
//         mainLogic = `
//         int main() {
//             string line1;
//             getline(cin, line1);
//             vector<int> nums = parseVectorInt(line1);
//             int val;
//             cin >> val;
//             Solution sol;
//             auto result = sol.${functionName}(nums, val);
//             ${functionName === 'twoSum' ? 'printVector(result);' : 'cout << result << endl;'}
//             return 0;
//         }`;
//     }
//     // Signature: (vector<int>&, vector<int>&) -> double
//     else if (functionName === 'findMedianSortedArrays') {
//         mainLogic = `
//         int main() {
//             string line1, line2;
//             getline(cin, line1);
//             getline(cin, line2);
//             vector<int> nums1 = parseVectorInt(line1);
//             vector<int> nums2 = parseVectorInt(line2);
//             Solution sol;
//             double result = sol.findMedianSortedArrays(nums1, nums2);
//             cout << fixed << setprecision(5) << result << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (ListNode*) -> T
//     else if (functionName === 'reverseList') {
//         mainLogic = `
//         int main() {
//             string line;
//             getline(cin, line);
//             ListNode* head = parseLinkedList(line);
//             Solution sol;
//             ListNode* result = sol.reverseList(head);
//             printLinkedList(result);
//             return 0;
//         }`;
//     }
//     // Signature: (ListNode*, ListNode*) -> ListNode*
//     else if (functionName === 'mergeTwoLists') {
//         mainLogic = `
//         int main() {
//             string line1, line2;
//             getline(cin, line1);
//             getline(cin, line2);
//             ListNode* l1 = parseLinkedList(line1);
//             ListNode* l2 = parseLinkedList(line2);
//             Solution sol;
//             ListNode* result = sol.mergeTwoLists(l1, l2);
//             printLinkedList(result);
//             return 0;
//         }`;
//     }
//     // Signature: (ListNode*, int) -> ListNode*
//     else if (functionName === 'removeNthFromEnd') {
//         mainLogic = `
//         int main() {
//             string line;
//             getline(cin, line);
//             int n;
//             cin >> n;
//             ListNode* head = parseLinkedList(line);
//             Solution sol;
//             ListNode* result = sol.removeNthFromEnd(head, n);
//             printLinkedList(result);
//             return 0;
//         }`;
//     }
//     // Signature: (TreeNode*) -> T
//     else if (functionName === 'maxDepth' || functionName === 'isValidBST') {
//         mainLogic = `
//         int main() {
//             string line;
//             getline(cin, line);
//             TreeNode* root = parseTree(line);
//             Solution sol;
//             auto result = sol.${functionName}(root);
//             cout << ${functionName === 'maxDepth' ? 'result' : '(result ? "true" : "false")'} << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (TreeNode*, TreeNode*) -> bool
//     else if (functionName === 'isSameTree') {
//         mainLogic = `
//         int main() {
//             string line1, line2;
//             getline(cin, line1);
//             getline(cin, line2);
//             TreeNode* p = parseTree(line1);
//             TreeNode* q = parseTree(line2);
//             Solution sol;
//             cout << (sol.isSameTree(p, q) ? "true" : "false") << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (TreeNode*, int) -> int
//     else if (functionName === 'kthSmallest') {
//         mainLogic = `
//         int main() {
//             string line;
//             getline(cin, line);
//             int k;
//             cin >> k;
//             TreeNode* root = parseTree(line);
//             Solution sol;
//             cout << sol.kthSmallest(root, k) << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (vector<vector<char>>&) -> int
//     else if (functionName === 'numIslands') {
//         mainLogic = `
//         int main() {
//             string first_line;
//             getline(cin, first_line);
//             stringstream ss(first_line);
//             int m, n;
//             ss >> m >> n;
//             vector<vector<char>> grid(m, vector<char>(n));
//             for (int i = 0; i < m; ++i) {
//                 string row_line;
//                 getline(cin, row_line);
//                 stringstream row_ss(row_line);
//                 for (int j = 0; j < n; ++j) {
//                     row_ss >> grid[i][j];
//                 }
//             }
//             Solution sol;
//             cout << sol.numIslands(grid) << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (int, vector<vector<int>>&) -> bool
//     else if (functionName === 'canFinish') {
//         mainLogic = `
//         int main() {
//             string first_line;
//             getline(cin, first_line);
//             stringstream ss(first_line);
//             int numCourses, prereq_count;
//             ss >> numCourses >> prereq_count;
//             vector<vector<int>> prerequisites;
//             for (int i = 0; i < prereq_count; ++i) {
//                 int u, v;
//                 cin >> u >> v;
//                 prerequisites.push_back({u, v});
//             }
//             Solution sol;
//             cout << (sol.canFinish(numCourses, prerequisites) ? "true" : "false") << endl;
//             return 0;
//         }`;
//     }
//     else {
//         throw new Error(`C++ harness for function '${functionName}' is not implemented.`);
//     }
//     return `${CPP_BOILERPLATE}\n${wrappedUserCode}\n${mainLogic}`;
// }

// function buildJavaHarness(userCode, functionName) {
//     const wrappedUserCode = `    static class Solution { ${userCode} }`;
//     let mainLogic = '';
    
//     // --- Boilerplate parts for main method ---
//     const scannerInit = `public static void main(String[] args) {\n            Scanner sc = new Scanner(System.in);`;
//     const scannerClose = `sc.close();\n        }`;

//     // --- Logic goes here ---
//     if (functionName === 'isAnagram') {
//         mainLogic = `
//             String s = sc.nextLine();
//             String t = sc.nextLine();
//             Solution sol = new Solution();
//             System.out.println(sol.isAnagram(s, t));
//         `;
//     } else if (['maxProfit', 'longestConsecutive', 'trap', 'minCostClimbingStairs', 'rob'].includes(functionName)) {
//         mainLogic = `
//             String line = sc.hasNextLine() ? sc.nextLine() : "";
//             Solution sol = new Solution();
//             System.out.println(sol.${functionName}(parseIntArray(line)));
//         `;
//     } else if (functionName === 'climbStairs') {
//         mainLogic = `
//             int n = sc.nextInt();
//             Solution sol = new Solution();
//             System.out.println(sol.climbStairs(n));
//         `;
//     } else if (functionName === 'moveZeroes') { // In-place modification
//         mainLogic = `
//             String line = sc.hasNextLine() ? sc.nextLine() : "";
//             int[] nums = parseIntArray(line);
//             Solution sol = new Solution();
//             sol.moveZeroes(nums);
//             for (int i = 0; i < nums.length; i++) {
//                 System.out.print(nums[i] + (i == nums.length - 1 ? "" : " "));
//             }
//             System.out.println();
//         `;
//     } else if (['twoSum', 'productExceptSelf'].includes(functionName)) { // Returns int[]
//          mainLogic = `
//             String line = sc.hasNextLine() ? sc.nextLine() : "";
//             int[] nums = parseIntArray(line);
//             ${functionName === 'twoSum' ? 'int target = sc.nextInt();' : ''}
//             Solution sol = new Solution();
//             int[] result = sol.${functionName}(nums${functionName === 'twoSum' ? ', target' : ''});
//             for (int i = 0; i < result.length; i++) {
//                 System.out.print(result[i] + (i == result.length - 1 ? "" : " "));
//             }
//             System.out.println();
//         `;
//     } else if (functionName === 'coinChange') {
//         mainLogic = `
//             String line = sc.hasNextLine() ? sc.nextLine() : "";
//             int[] coins = parseIntArray(line);
//             int amount = sc.nextInt();
//             Solution sol = new Solution();
//             System.out.println(sol.coinChange(coins, amount));
//         `;
//     } else if (functionName === 'findMedianSortedArrays') {
//         mainLogic = `
//             String line1 = sc.hasNextLine() ? sc.nextLine() : "";
//             String line2 = sc.hasNextLine() ? sc.nextLine() : "";
//             int[] nums1 = parseIntArray(line1);
//             int[] nums2 = parseIntArray(line2);
//             Solution sol = new Solution();
//             System.out.printf("%.5f%n", sol.findMedianSortedArrays(nums1, nums2));
//         `;
//     } else if (['reverseList', 'removeNthFromEnd'].includes(functionName)) {
//         mainLogic = `
//             String line = sc.hasNextLine() ? sc.nextLine() : "";
//             ListNode head = parseLinkedList(line);
//             ${functionName === 'removeNthFromEnd' ? 'int n = sc.nextInt();' : ''}
//             Solution sol = new Solution();
//             ListNode result = sol.${functionName}(head${functionName === 'removeNthFromEnd' ? ', n' : ''});
//             while(result != null) {
//                 System.out.print(result.val + (result.next != null ? " " : ""));
//                 result = result.next;
//             }
//             System.out.println();
//         `;
//     } else if (functionName === 'mergeTwoLists') {
//          mainLogic = `
//             String line1 = sc.hasNextLine() ? sc.nextLine() : "";
//             String line2 = sc.hasNextLine() ? sc.nextLine() : "";
//             ListNode l1 = parseLinkedList(line1);
//             ListNode l2 = parseLinkedList(line2);
//             Solution sol = new Solution();
//             ListNode result = sol.mergeTwoLists(l1, l2);
//             while(result != null) {
//                 System.out.print(result.val + (result.next != null ? " " : ""));
//                 result = result.next;
//             }
//             System.out.println();
//         `;
//     } else if (['maxDepth', 'isValidBST'].includes(functionName)) {
//         mainLogic = `
//             String line = sc.hasNextLine() ? sc.nextLine() : "";
//             TreeNode root = parseTree(line);
//             Solution sol = new Solution();
//             System.out.println(sol.${functionName}(root));
//         `;
//     } else if (functionName === 'isSameTree') {
//         mainLogic = `
//             String line1 = sc.hasNextLine() ? sc.nextLine() : "";
//             String line2 = sc.hasNextLine() ? sc.nextLine() : "";
//             TreeNode p = parseTree(line1);
//             TreeNode q = parseTree(line2);
//             Solution sol = new Solution();
//             System.out.println(sol.isSameTree(p, q));
//         `;
//     } else if (functionName === 'kthSmallest') {
//         mainLogic = `
//             String line = sc.hasNextLine() ? sc.nextLine() : "";
//             TreeNode root = parseTree(line);
//             int k = sc.nextInt();
//             Solution sol = new Solution();
//             System.out.println(sol.kthSmallest(root, k));
//         `;
//     } else if (functionName === 'numIslands') {
//         mainLogic = `
//             int m = sc.nextInt();
//             int n = sc.nextInt();
//             char[][] grid = new char[m][n];
//             for(int i = 0; i < m; i++) {
//                 for(int j = 0; j < n; j++) {
//                     grid[i][j] = sc.next().charAt(0);
//                 }
//             }
//             Solution sol = new Solution();
//             System.out.println(sol.numIslands(grid));
//         `;
//     } else if (functionName === 'canFinish') {
//          mainLogic = `
//             int numCourses = sc.nextInt();
//             int p_count = sc.nextInt();
//             int[][] prereqs = new int[p_count][2];
//             for (int i = 0; i < p_count; i++) {
//                 prereqs[i][0] = sc.nextInt();
//                 prereqs[i][1] = sc.nextInt();
//             }
//             Solution sol = new Solution();
//             System.out.println(sol.canFinish(numCourses, prereqs));
//         `;
//     }
//     else {
//         throw new Error(`Java harness for function '${functionName}' is not implemented.`);
//     }

//     return `${JAVA_BOILERPLATE}\n${wrappedUserCode}\n${scannerInit}\n${mainLogic}\n${scannerClose}\n}`;
// }

// function buildJsHarness(userCode, functionName) {
//     const mainLogic = `
//     function run(input) {
//         const lines = input.trim().split('\\n');
        
//         if ("${functionName}" === "isAnagram") {
//             const result = ${functionName}(lines[0] || "", lines[1] || "");
//             console.log(result);
//         }
//         else if (["maxProfit", "longestConsecutive", "trap", "minCostClimbingStairs", "rob", "containsDuplicate"].includes("${functionName}")) {
//             const nums = lines[0] ? lines[0].trim().split(/\\s+/).map(Number) : [];
//             const result = ${functionName}(nums);
//             console.log(result);
//         }
//         else if ("${functionName}" === "moveZeroes") {
//             const nums = lines[0] ? lines[0].trim().split(/\\s+/).map(Number) : [];
//             ${functionName}(nums); // In-place
//             console.log(nums.join(' '));
//         }
//         else if (["productExceptSelf", "twoSum"].includes("${functionName}")) {
//             const nums = lines[0] ? lines[0].trim().split(/\\s+/).map(Number) : [];
//             const target = lines.length > 1 ? Number(lines[1]) : undefined;
//             const result = ${functionName}(nums, target);
//             console.log(result.join(' '));
//         }
//         else if ("${functionName}" === "climbStairs") {
//             const n = Number(lines[0]);
//             const result = ${functionName}(n);
//             console.log(result);
//         }
//         else if ("${functionName}" === "coinChange") {
//             const coins = lines[0] ? lines[0].trim().split(/\\s+/).map(Number) : [];
//             const amount = Number(lines[1]);
//             const result = ${functionName}(coins, amount);
//             console.log(result);
//         }
//         else if ("${functionName}" === "findMedianSortedArrays") {
//             const nums1 = lines[0] ? lines[0].trim().split(/\\s+/).map(Number) : [];
//             const nums2 = lines.length > 1 && lines[1] ? lines[1].trim().split(/\\s+/).map(Number) : [];
//             const result = ${functionName}(nums1, nums2);
//             console.log(result.toFixed(5));
//         }
//         else if (["reverseList", "maxDepth", "isValidBST"].includes("${functionName}")) {
//             const headOrRoot = "${functionName}" === "reverseList" ? parseLinkedList(lines[0]) : parseTree(lines[0]);
//             const result = ${functionName}(headOrRoot);
//             if (typeof result === 'object' && result !== null && result.hasOwnProperty('val')) { 
//                  let str = [];
//                  let curr = result;
//                  while(curr) { str.push(curr.val); curr = curr.next; }
//                  console.log(str.join(' '));
//             } else {
//                  console.log(result);
//             }
//         }
//         else if ("${functionName}" === "mergeTwoLists") {
//             const l1 = parseLinkedList(lines[0]);
//             const l2 = parseLinkedList(lines[1] || "");
//             const result = ${functionName}(l1, l2);
//             let str = [];
//             let curr = result;
//             while(curr) { str.push(curr.val); curr = curr.next; }
//             console.log(str.join(' '));
//         }
//         else if ("${functionName}" === "removeNthFromEnd") {
//             const head = parseLinkedList(lines[0]);
//             const n = Number(lines[1]);
//             const result = ${functionName}(head, n);
//             let str = [];
//             let curr = result;
//             while(curr) { str.push(curr.val); curr = curr.next; }
//             console.log(str.join(' '));
//         }
//         else if ("${functionName}" === "isSameTree") {
//             const p = parseTree(lines[0]);
//             const q = parseTree(lines[1] || "");
//             console.log(${functionName}(p, q));
//         }
//         else if ("${functionName}" === "kthSmallest") {
//             const root = parseTree(lines[0]);
//             const k = Number(lines[1]);
//             console.log(${functionName}(root, k));
//         }
//         else if ("${functionName}" === "numIslands") {
//             const [rows, cols] = lines[0].trim().split(/\\s+/).map(Number);
//             const grid = [];
//             for (let i = 1; i <= rows; i++) {
//                 const rowContent = lines[i].trim().split(/\\s+/);
//                 grid.push(rowContent);
//             }
//             console.log(${functionName}(grid));
//         }
//         else if ("${functionName}" === "canFinish") {
//             const [numCourses, prereq_count] = lines[0].trim().split(/\\s+/).map(Number);
//             const prerequisites = [];
//             for(let i=1; i < 1 + prereq_count; i++) {
//                 prerequisites.push(lines[i].trim().split(/\\s+/).map(Number));
//             }
//             console.log(${functionName}(numCourses, prerequisites));
//         }
//         else {
//             throw new Error(\`JS harness for function '\${"${functionName}"}' is not implemented.\`);
//         }
//     }

//     process.stdin.resume();
//     process.stdin.setEncoding('utf-8');
//     let stdin_input = '';
//     process.stdin.on('data', (input) => (stdin_input += input));
//     process.stdin.on('end', () => run(stdin_input));
//     `;

//     return `${JS_BOILERPLATE}\n${userCode}\n${mainLogic}`;
// }


// function buildHarness(language, userCode, functionName, problemTag) {    
//     if (language === 'cpp') {
//         return buildCppHarness(userCode, functionName); 
//     }
//     if (language === 'java') {
//         return buildJavaHarness(userCode, functionName);
//     }
//     if (language === 'javascript') {
//         return buildJsHarness(userCode, functionName);
//     }
    
//     throw new Error(`Harness generation for language '${language}' is not supported.`);
// }

// module.exports = { buildHarness };
 




// const CPP_BOILERPLATE = `
// #include <iostream>
// #include <vector>
// #include <string>
// #include <sstream>
// #include <queue>
// #include <stack>
// #include <unordered_map>
// #include <unordered_set>
// #include <algorithm>
// #include <iomanip> // For setprecision

// using namespace std;

// // --- Standard Data Structures ---
// struct ListNode {
//     int val;
//     ListNode *next;
//     ListNode() : val(0), next(nullptr) {}
//     ListNode(int x) : val(x), next(nullptr) {}
//     ListNode(int x, ListNode *next) : val(x), next(next) {}
// };

// struct TreeNode {
//     int val;
//     TreeNode *left;
//     TreeNode *right;
//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
// };

// // --- Input Parsers ---
// vector<int> parseVectorInt(string& line) {
//     vector<int> nums;
//     if (line.empty()) return nums;
//     stringstream ss(line);
//     int num;
//     while(ss >> num) nums.push_back(num);
//     return nums;
// }

// ListNode* parseLinkedList(string& line) {
//     if (line.empty()) return nullptr;
//     vector<int> nodes = parseVectorInt(line);
//     if (nodes.empty()) return nullptr;
//     ListNode* head = new ListNode(nodes[0]);
//     ListNode* current = head;
//     for (size_t i = 1; i < nodes.size(); ++i) {
//         current->next = new ListNode(nodes[i]);
//         current = current->next;
//     }
//     return head;
// }

// TreeNode* parseTree(string& line) {
//     if (line.empty() || line == "null") return nullptr;
//     stringstream ss(line);
//     string nodeStr;
//     vector<string> nodes;
//     while(ss >> nodeStr) nodes.push_back(nodeStr);
    
//     if (nodes.empty() || nodes[0] == "null") return nullptr;

//     TreeNode* root = new TreeNode(stoi(nodes[0]));
//     queue<TreeNode*> q;
//     q.push(root);
//     int i = 1;
//     while (!q.empty() && i < nodes.size()) {
//         TreeNode* current = q.front();
//         q.pop();
//         if (nodes[i] != "null") {
//             current->left = new TreeNode(stoi(nodes[i]));
//             q.push(current->left);
//         }
//         i++;
//         if (i < nodes.size() && nodes[i] != "null") {
//             current->right = new TreeNode(stoi(nodes[i]));
//             q.push(current->right);
//         }
//         i++;
//     }
//     return root;
// }

// // --- Output Printers ---
// void printVector(const vector<int>& vec) {
//     for(size_t i = 0; i < vec.size(); ++i) {
//         cout << vec[i] << (i == vec.size() - 1 ? "" : " ");
//     }
//     cout << endl;
// }

// void printLinkedList(ListNode* head) {
//     while(head) {
//         cout << head->val << (head->next ? " " : "");
//         head = head->next;
//     }
//     cout << endl;
// }

// void printTreeLevelOrder(TreeNode* root) {
//     if (!root) return;
//     vector<int> result;
//     queue<TreeNode*> q;
//     q.push(root);
//     while (!q.empty()) {
//         TreeNode* node = q.front();
//         q.pop();
//         result.push_back(node->val);
//         if (node->left) q.push(node->left);
//         if (node->right) q.push(node->right);
//     }
//     printVector(result);
// }
// `;

// const JAVA_BOILERPLATE = `
// import java.util.*;

// class ListNode { int val; ListNode next; ListNode(int x) { val = x; } }
// class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x) { val = x; } }

// public class Main {
//     // --- Input Parsers ---
//     private static int[] parseIntArray(String line) {
//         if (line == null || line.isEmpty()) return new int[0];
//         String[] parts = line.trim().split("\\\\s+");
//         int[] arr = new int[parts.length];
//         for (int i = 0; i < parts.length; i++) {
//             arr[i] = Integer.parseInt(parts[i]);
//         }
//         return arr;
//     }

//     private static ListNode parseLinkedList(String line) {
//         if (line == null || line.isEmpty()) return null;
//         int[] nodes = parseIntArray(line);
//         if (nodes.length == 0) return null;
//         ListNode head = new ListNode(nodes[0]);
//         ListNode current = head;
//         for (int i = 1; i < nodes.length; i++) {
//             current.next = new ListNode(nodes[i]);
//             current = current.next;
//         }
//         return head;
//     }

//     private static TreeNode parseTree(String line) {
//         if (line == null || line.isEmpty() || line.equals("null")) return null;
//         String[] nodes = line.trim().split("\\\\s+");
//         if (nodes.length == 0 || nodes[0].equals("null")) return null;

//         TreeNode root = new TreeNode(Integer.parseInt(nodes[0]));
//         Queue<TreeNode> queue = new LinkedList<>();
//         queue.add(root);
//         int i = 1;
//         while (!queue.isEmpty() && i < nodes.length) {
//             TreeNode current = queue.poll();
//             if (!nodes[i].equals("null")) {
//                 current.left = new TreeNode(Integer.parseInt(nodes[i]));
//                 queue.add(current.left);
//             }
//             i++;
//             if (i < nodes.length && !nodes[i].equals("null")) {
//                 current.right = new TreeNode(Integer.parseInt(nodes[i]));
//                 queue.add(current.right);
//             }
//             i++;
//         }
//         return root;
//     }
// `;

// const JS_BOILERPLATE = `
// function ListNode(val, next) {
//     this.val = (val===undefined ? 0 : val)
//     this.next = (next===undefined ? null : next)
// }

// function TreeNode(val, left, right) {
//     this.val = (val===undefined ? 0 : val)
//     this.left = (left===undefined ? null : left)
//     this.right = (right===undefined ? null : right)
// }

// // --- Input Parsers for JS ---
// function parseLinkedList(line) {
//     if (!line) return null;
//     const nodes = line.split(' ').map(Number);
//     if (nodes.length === 0) return null;
//     let head = new ListNode(nodes[0]);
//     let current = head;
//     for (let i = 1; i < nodes.length; i++) {
//         current.next = new ListNode(nodes[i]);
//         current = current.next;
//     }
//     return head;
// }

// function parseTree(line) {
//     if (!line || line === 'null') return null;
//     const nodes = line.split(' ');
//     if (nodes.length === 0 || nodes[0] === 'null') return null;

//     let root = new TreeNode(parseInt(nodes[0], 10));
//     let queue = [root];
//     let i = 1;
//     while (queue.length > 0 && i < nodes.length) {
//         let current = queue.shift();
//         if (nodes[i] !== 'null') {
//             current.left = new TreeNode(parseInt(nodes[i], 10));
//             queue.push(current.left);
//         }
//         i++;
//         if (i < nodes.length && nodes[i] !== 'null') {
//             current.right = new TreeNode(parseInt(nodes[i], 10));
//             queue.push(current.right);
//         }
//         i++;
//     }
//     return root;
// }
// `;

// function buildCppHarness(userCode, functionName) {
//     const wrappedUserCode = `
// class Solution {
// public:
//     ${userCode}
// };
//     `;
//     let mainLogic = '';
    
//     // --- Grouped by Signature for Simplicity ---

//     // Signature: (vector<int>&) -> T
//     const singleVectorFuncs = new Set(['maxProfit', 'containsDuplicate', 'productExceptSelf', 'longestConsecutive', 'trap', 'moveZeroes', 'minCostClimbingStairs', 'rob']);
//     if (singleVectorFuncs.has(functionName)) {
//         let outputType = 'int';
//         if (functionName === 'containsDuplicate') outputType = 'bool';
//         if (functionName === 'productExceptSelf' || functionName === 'moveZeroes') outputType = 'vector';
        
//         if (outputType === 'vector') {
//              mainLogic = `
//             int main() {
//                 string line;
//                 getline(cin, line);
//                 vector<int> nums = parseVectorInt(line);
//                 Solution sol;
//                 ${functionName === 'moveZeroes' ? 'sol.moveZeroes(nums); printVector(nums);' : 'vector<int> result = sol.productExceptSelf(nums); printVector(result);'}
//                 return 0;
//             }`;
//         } else {
//             mainLogic = `
//             int main() {
//                 string line;
//                 getline(cin, line);
//                 vector<int> nums = parseVectorInt(line);
//                 Solution sol;
//                 auto result = sol.${functionName}(nums);
//                 cout << ${outputType === 'bool' ? '(result ? "true" : "false")' : 'result'} << endl;
//                 return 0;
//             }`;
//         }
//     }
//     // Signature: (int) -> T
//     else if (functionName === 'climbStairs') {
//         mainLogic = `
//         int main() {
//             int n;
//             cin >> n;
//             Solution sol;
//             cout << sol.climbStairs(n) << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (string, string) -> bool
//     else if (functionName === 'isAnagram') {
//         mainLogic = `
//         int main() {
//             string s, t;
//             getline(cin, s);
//             getline(cin, t);
//             Solution sol;
//             cout << (sol.isAnagram(s, t) ? "true" : "false") << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (vector<int>&, int) -> T
//     else if (functionName === 'twoSum' || functionName === 'coinChange') {
//         mainLogic = `
//         int main() {
//             string line1;
//             getline(cin, line1);
//             vector<int> nums = parseVectorInt(line1);
//             int val;
//             cin >> val;
//             Solution sol;
//             auto result = sol.${functionName}(nums, val);
//             ${functionName === 'twoSum' ? 'printVector(result);' : 'cout << result << endl;'}
//             return 0;
//         }`;
//     }
//     // Signature: (vector<int>&, vector<int>&) -> double
//     else if (functionName === 'findMedianSortedArrays') {
//         mainLogic = `
//         int main() {
//             string line1, line2;
//             getline(cin, line1);
//             getline(cin, line2);
//             vector<int> nums1 = parseVectorInt(line1);
//             vector<int> nums2 = parseVectorInt(line2);
//             Solution sol;
//             double result = sol.findMedianSortedArrays(nums1, nums2);
//             cout << fixed << setprecision(5) << result << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (ListNode*) -> T
//     else if (functionName === 'reverseList') {
//         mainLogic = `
//         int main() {
//             string line;
//             getline(cin, line);
//             ListNode* head = parseLinkedList(line);
//             Solution sol;
//             ListNode* result = sol.reverseList(head);
//             printLinkedList(result);
//             return 0;
//         }`;
//     }
//     // Signature: (ListNode*, ListNode*) -> ListNode*
//     else if (functionName === 'mergeTwoLists') {
//         mainLogic = `
//         int main() {
//             string line1, line2;
//             getline(cin, line1);
//             getline(cin, line2);
//             ListNode* l1 = parseLinkedList(line1);
//             ListNode* l2 = parseLinkedList(line2);
//             Solution sol;
//             ListNode* result = sol.mergeTwoLists(l1, l2);
//             printLinkedList(result);
//             return 0;
//         }`;
//     }
//     // Signature: (ListNode*, int) -> ListNode*
//     else if (functionName === 'removeNthFromEnd') {
//         mainLogic = `
//         int main() {
//             string line;
//             getline(cin, line);
//             int n;
//             cin >> n;
//             ListNode* head = parseLinkedList(line);
//             Solution sol;
//             ListNode* result = sol.removeNthFromEnd(head, n);
//             printLinkedList(result);
//             return 0;
//         }`;
//     }
//     // Signature: (TreeNode*) -> T
//     else if (functionName === 'maxDepth' || functionName === 'isValidBST') {
//         mainLogic = `
//         int main() {
//             string line;
//             getline(cin, line);
//             TreeNode* root = parseTree(line);
//             Solution sol;
//             auto result = sol.${functionName}(root);
//             cout << ${functionName === 'maxDepth' ? 'result' : '(result ? "true" : "false")'} << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (TreeNode*, TreeNode*) -> bool
//     else if (functionName === 'isSameTree') {
//         mainLogic = `
//         int main() {
//             string line1, line2;
//             getline(cin, line1);
//             getline(cin, line2);
//             TreeNode* p = parseTree(line1);
//             TreeNode* q = parseTree(line2);
//             Solution sol;
//             cout << (sol.isSameTree(p, q) ? "true" : "false") << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (TreeNode*, int) -> int
//     else if (functionName === 'kthSmallest') {
//         mainLogic = `
//         int main() {
//             string line;
//             getline(cin, line);
//             int k;
//             cin >> k;
//             TreeNode* root = parseTree(line);
//             Solution sol;
//             cout << sol.kthSmallest(root, k) << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (vector<vector<char>>&) -> int
//     else if (functionName === 'numIslands') {
//         mainLogic = `
//         int main() {
//             int m, n;
//             cin >> m >> n;
//             vector<vector<char>> grid(m, vector<char>(n));
//             for (int i = 0; i < m; ++i) {
//                 for (int j = 0; j < n; ++j) {
//                     cin >> grid[i][j];
//                 }
//             }
//             Solution sol;
//             cout << sol.numIslands(grid) << endl;
//             return 0;
//         }`;
//     }
//     // Signature: (int, vector<vector<int>>&) -> bool
//     else if (functionName === 'canFinish') {
//         mainLogic = `
//         int main() {
//             int numCourses, prereq_count;
//             cin >> numCourses >> prereq_count;
//             vector<vector<int>> prerequisites(prereq_count, vector<int>(2));
//             for (int i = 0; i < prereq_count; ++i) {
//                 cin >> prerequisites[i][0] >> prerequisites[i][1];
//             }
//             Solution sol;
//             cout << (sol.canFinish(numCourses, prerequisites) ? "true" : "false") << endl;
//             return 0;
//         }`;
//     }
//     else {
//         throw new Error(`C++ harness for function '${functionName}' is not implemented.`);
//     }
//     return `${CPP_BOILERPLATE}\n${wrappedUserCode}\n${mainLogic}`;
// }

// function buildJavaHarness(userCode, functionName) {
//     const wrappedUserCode = `    static class Solution { ${userCode} }`;
//     let mainLogic = '';
    
//     // --- Boilerplate parts for main method ---
//     const scannerInit = `public static void main(String[] args) {\n            Scanner sc = new Scanner(System.in);`;
//     const scannerClose = `sc.close();\n        }`;

//     // --- Logic goes here ---
//     if (functionName === 'isAnagram') {
//         mainLogic = `
//             String s = sc.nextLine();
//             String t = sc.nextLine();
//             Solution sol = new Solution();
//             System.out.println(sol.isAnagram(s, t));
//         `;
//     } else if (['maxProfit', 'longestConsecutive', 'trap', 'climbStairs', 'minCostClimbingStairs', 'rob'].includes(functionName)) {
//         mainLogic = `
//             int[] nums = parseIntArray(sc.nextLine());
//             Solution sol = new Solution();
//             System.out.println(sol.${functionName}(nums));
//         `;
//     } else if (functionName === 'moveZeroes') { // In-place modification
//         mainLogic = `
//             int[] nums = parseIntArray(sc.nextLine());
//             Solution sol = new Solution();
//             sol.moveZeroes(nums);
//             for (int i = 0; i < nums.length; i++) {
//                 System.out.print(nums[i] + (i == nums.length - 1 ? "" : " "));
//             }
//             System.out.println();
//         `;
//     } else if (['twoSum', 'productExceptSelf'].includes(functionName)) { // Returns int[]
//          mainLogic = `
//             int[] nums = parseIntArray(sc.nextLine());
//             ${functionName === 'twoSum' ? 'int target = sc.nextInt();' : ''}
//             Solution sol = new Solution();
//             int[] result = sol.${functionName}(nums${functionName === 'twoSum' ? ', target' : ''});
//             for (int i = 0; i < result.length; i++) {
//                 System.out.print(result[i] + (i == result.length - 1 ? "" : " "));
//             }
//             System.out.println();
//         `;
//     } else if (functionName === 'coinChange') {
//         mainLogic = `
//             int[] coins = parseIntArray(sc.nextLine());
//             int amount = sc.nextInt();
//             Solution sol = new Solution();
//             System.out.println(sol.coinChange(coins, amount));
//         `;
//     } else if (functionName === 'findMedianSortedArrays') {
//         mainLogic = `
//             int[] nums1 = parseIntArray(sc.nextLine());
//             int[] nums2 = parseIntArray(sc.nextLine());
//             Solution sol = new Solution();
//             System.out.printf("%.5f%n", sol.findMedianSortedArrays(nums1, nums2));
//         `;
//     } else if (['reverseList', 'removeNthFromEnd'].includes(functionName)) {
//         mainLogic = `
//             ListNode head = parseLinkedList(sc.nextLine());
//             ${functionName === 'removeNthFromEnd' ? 'int n = sc.nextInt();' : ''}
//             Solution sol = new Solution();
//             ListNode result = sol.${functionName}(head${functionName === 'removeNthFromEnd' ? ', n' : ''});
//             while(result != null) {
//                 System.out.print(result.val + (result.next != null ? " " : ""));
//                 result = result.next;
//             }
//             System.out.println();
//         `;
//     } else if (functionName === 'mergeTwoLists') {
//          mainLogic = `
//             ListNode l1 = parseLinkedList(sc.nextLine());
//             ListNode l2 = parseLinkedList(sc.nextLine());
//             Solution sol = new Solution();
//             ListNode result = sol.mergeTwoLists(l1, l2);
//             while(result != null) {
//                 System.out.print(result.val + (result.next != null ? " " : ""));
//                 result = result.next;
//             }
//             System.out.println();
//         `;
//     } else if (['maxDepth', 'isValidBST'].includes(functionName)) {
//         mainLogic = `
//             TreeNode root = parseTree(sc.nextLine());
//             Solution sol = new Solution();
//             System.out.println(sol.${functionName}(root));
//         `;
//     } else if (functionName === 'isSameTree') {
//         mainLogic = `
//             TreeNode p = parseTree(sc.nextLine());
//             TreeNode q = parseTree(sc.nextLine());
//             Solution sol = new Solution();
//             System.out.println(sol.isSameTree(p, q));
//         `;
//     } else if (functionName === 'kthSmallest') {
//         mainLogic = `
//             TreeNode root = parseTree(sc.nextLine());
//             int k = sc.nextInt();
//             Solution sol = new Solution();
//             System.out.println(sol.kthSmallest(root, k));
//         `;
//     } else if (functionName === 'numIslands') {
//         mainLogic = `
//             int m = sc.nextInt();
//             int n = sc.nextInt();
//             sc.nextLine(); // consume newline
//             char[][] grid = new char[m][n];
//             for(int i = 0; i < m; i++) {
//                 String row = sc.nextLine().replaceAll(" ", "");
//                 grid[i] = row.toCharArray();
//             }
//             Solution sol = new Solution();
//             System.out.println(sol.numIslands(grid));
//         `;
//     } else if (functionName === 'canFinish') {
//          mainLogic = `
//             int numCourses = sc.nextInt();
//             int p_count = sc.nextInt();
//             int[][] prereqs = new int[p_count][2];
//             for (int i = 0; i < p_count; i++) {
//                 prereqs[i][0] = sc.nextInt();
//                 prereqs[i][1] = sc.nextInt();
//             }
//             Solution sol = new Solution();
//             System.out.println(sol.canFinish(numCourses, prereqs));
//         `;
//     }
//     else {
//         // This will now only be hit for functions from your original code if they are not re-added here.
//         // It's better to be explicit for all supported functions.
//         throw new Error(`Java harness for function '${functionName}' is not implemented.`);
//     }

//     return `${JAVA_BOILERPLATE}\n${wrappedUserCode}\n${scannerInit}\n${mainLogic}\n${scannerClose}\n}`;
// }

// function buildJsHarness(userCode, functionName) {
//     // The main logic wrapper reads all input and then calls the specific harness logic.
//     const mainLogic = `
//     function run(input) {
//         const lines = input.trim().split('\\n');
        
//         // --- Harness dispatch based on functionName ---
//         if ("${functionName}" === "isAnagram") {
//             const result = ${functionName}(lines[0], lines[1]);
//             console.log(result);
//         }
//         else if (["maxProfit", "longestConsecutive", "trap", "minCostClimbingStairs", "rob", "containsDuplicate"].includes("${functionName}")) {
//             const nums = lines[0].split(' ').map(Number);
//             const result = ${functionName}(nums);
//             console.log(result);
//         }
//         else if ("${functionName}" === "moveZeroes") {
//             const nums = lines[0].split(' ').map(Number);
//             ${functionName}(nums); // In-place
//             console.log(nums.join(' '));
//         }
//         else if (["productExceptSelf", "twoSum"].includes("${functionName}")) {
//             const nums = lines[0].split(' ').map(Number);
//             const target = lines.length > 1 ? Number(lines[1]) : undefined;
//             const result = ${functionName}(nums, target);
//             console.log(result.join(' '));
//         }
//         else if ("${functionName}" === "climbStairs") {
//             const n = Number(lines[0]);
//             const result = ${functionName}(n);
//             console.log(result);
//         }
//         else if ("${functionName}" === "coinChange") {
//             const coins = lines[0].split(' ').map(Number);
//             const amount = Number(lines[1]);
//             const result = ${functionName}(coins, amount);
//             console.log(result);
//         }
//         else if ("${functionName}" === "findMedianSortedArrays") {
//             const nums1 = lines[0] ? lines[0].split(' ').map(Number) : [];
//             const nums2 = lines[1] ? lines[1].split(' ').map(Number) : [];
//             const result = ${functionName}(nums1, nums2);
//             console.log(result.toFixed(5));
//         }
//         else if (["reverseList", "maxDepth", "isValidBST"].includes("${functionName}")) {
//             const headOrRoot = "${functionName}" === "reverseList" ? parseLinkedList(lines[0]) : parseTree(lines[0]);
//             const result = ${functionName}(headOrRoot);
//             if (typeof result === 'object' && result !== null && result.hasOwnProperty('val')) { // It's a list/tree
//                  let str = [];
//                  let curr = result;
//                  while(curr) { str.push(curr.val); curr = curr.next; }
//                  console.log(str.join(' '));
//             } else {
//                  console.log(result);
//             }
//         }
//         else if ("${functionName}" === "mergeTwoLists") {
//             const l1 = parseLinkedList(lines[0]);
//             const l2 = parseLinkedList(lines[1]);
//             const result = ${functionName}(l1, l2);
//             let str = [];
//             let curr = result;
//             while(curr) { str.push(curr.val); curr = curr.next; }
//             console.log(str.join(' '));
//         }
//         else if ("${functionName}" === "removeNthFromEnd") {
//             const head = parseLinkedList(lines[0]);
//             const n = Number(lines[1]);
//             const result = ${functionName}(head, n);
//             let str = [];
//             let curr = result;
//             while(curr) { str.push(curr.val); curr = curr.next; }
//             console.log(str.join(' '));
//         }
//         else if ("${functionName}" === "isSameTree") {
//             const p = parseTree(lines[0]);
//             const q = parseTree(lines[1]);
//             console.log(${functionName}(p, q));
//         }
//         else if ("${functionName}" === "kthSmallest") {
//             const root = parseTree(lines[0]);
//             const k = Number(lines[1]);
//             console.log(${functionName}(root, k));
//         }
//         else if ("${functionName}" === "numIslands") {
//             const [rows, cols] = lines[0].split(' ').map(Number);
//             const grid = [];
//             for (let i = 1; i <= rows; i++) {
//                 grid.push(lines[i].split('')); // Assuming '1 0 1' becomes ['1','0','1']
//             }
//             console.log(${functionName}(grid));
//         }
//         else if ("${functionName}" === "canFinish") {
//             const numCourses = Number(lines[0]);
//             const prereq_count = Number(lines[1]);
//             const prerequisites = [];
//             for(let i=2; i < 2 + prereq_count; i++) {
//                 prerequisites.push(lines[i].split(' ').map(Number));
//             }
//             console.log(${functionName}(numCourses, prerequisites));
//         }
//         else {
//             throw new Error('JS harness for function '${functionName}' is not implemented.');
//         }
//     }


//     process.stdin.resume(); 
//     process.stdin.setEncoding('utf-8');
//     let stdin_input = '';
//     process.stdin.on('data', (input) => (stdin_input += input));
//     process.stdin.on('end', () => run(stdin_input));
//     `;

//     return `${JS_BOILERPLATE}\n${userCode}\n${mainLogic}`;
// }


// function buildHarness(language, userCode, functionName, problemTag) {    
//     if (language === 'cpp') {
//         return buildCppHarness(userCode, functionName); 
//     }
//     if (language === 'java') {
//         return buildJavaHarness(userCode, functionName);
//     }
//     if (language === 'javascript') {
//         return buildJsHarness(userCode, functionName);
//     }
    
//     throw new Error(`Harness generation for language '${language}' is not supported.`);
// }

// module.exports = { buildHarness };



// const CPP_BOILERPLATE = `
// #include <iostream>
// #include <vector>
// #include <string>
// #include <sstream>
// #include <queue>
// #include <unordered_map>
// #include <unordered_set>
// #include <algorithm>

// using namespace std;

// // Standard Definitions
// struct ListNode {
//     int val;
//     ListNode *next;
//     ListNode() : val(0), next(nullptr) {}
//     ListNode(int x) : val(x), next(nullptr) {}
//     ListNode(int x, ListNode *next) : val(x), next(next) {}
// };

// struct TreeNode {
//     int val;
//     TreeNode *left;
//     TreeNode *right;
//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
// };

// // --- Input Parser for Linked List ---
// ListNode* parseLinkedList(string& line) {
//     if (line.empty()) return nullptr;
//     stringstream ss(line);
//     int val;
//     ListNode* head = nullptr, *tail = nullptr;
//     while(ss >> val) {
//         ListNode* newNode = new ListNode(val);
//         if (!head) {
//             head = tail = newNode;
//         } else {
//             tail->next = newNode;
//             tail = newNode;
//         }
//     }
//     return head;
// }

// // --- Input Parser for Tree ---
// TreeNode* parseTree(string& line) {
//     if (line.empty() || line == "null") return nullptr;
//     stringstream ss(line);
//     string nodeStr;
//     vector<string> nodes;
//     while(ss >> nodeStr) nodes.push_back(nodeStr);
    
//     if (nodes.empty() || nodes[0] == "null") return nullptr;

//     TreeNode* root = new TreeNode(stoi(nodes[0]));
//     queue<TreeNode*> q;
//     q.push(root);
//     int i = 1;
//     while (!q.empty() && i < nodes.size()) {
//         TreeNode* current = q.front();
//         q.pop();
//         if (nodes[i] != "null") {
//             current->left = new TreeNode(stoi(nodes[i]));
//             q.push(current->left);
//         }
//         i++;
//         if (i < nodes.size() && nodes[i] != "null") {
//             current->right = new TreeNode(stoi(nodes[i]));
//             q.push(current->right);
//         }
//         i++;
//     }
//     return root;
// }

// // --- Output Printers ---
// void printVector(const vector<int>& vec) {
//     for(size_t i = 0; i < vec.size(); ++i) {
//         cout << vec[i] << (i == vec.size() - 1 ? "" : " ");
//     }
//     cout << endl;
// }

// void printLinkedList(ListNode* head) {
//     while(head) {
//         cout << head->val << (head->next ? " " : "");
//         head = head->next;
//     }
//     cout << endl;
// }
// `;

// const JAVA_BOILERPLATE = `
// import java.util.*;

// class ListNode { int val; ListNode next; ListNode(int x) { val = x; } }
// class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x) { val = x; } }

// public class Main {
//     // --- Input Parsers ---
//     private static int[] parseIntArray(String line) {
//         if (line.isEmpty()) return new int[0];
//         String[] parts = line.split(" ");
//         int[] arr = new int[parts.length];
//         for (int i = 0; i < parts.length; i++) {
//             arr[i] = Integer.parseInt(parts[i]);
//         }
//         return arr;
//     }
//     // You would add Java parsers for List/Tree here if needed.
// `;

// const JS_BOILERPLATE = `
// function ListNode(val, next) {
//     this.val = (val===undefined ? 0 : val)
//     this.next = (next===undefined ? null : next)
// }

// function TreeNode(val, left, right) {
//     this.val = (val===undefined ? 0 : val)
//     this.left = (left===undefined ? null : left)
//     this.right = (right===undefined ? null : right)
// }
// `;

// function buildCppHarness(userCode, functionName, problemTag) {
//     const wrappedUserCode = `
// class Solution {
// public:
//     ${userCode}
// };
//     `;

//     let mainLogic = '';

//     // --- Harness for 'twoSum' ---
//     if (functionName === 'twoSum') {
//         mainLogic = `
//         int main() {
//             string line1;
//             getline(cin, line1);
//             stringstream ss1(line1);
//             vector<int> nums;
//             int num;
//             while(ss1 >> num) nums.push_back(num);
//             int target;
//             cin >> target;
//             Solution sol;
//             vector<int> result = sol.twoSum(nums, target);
//             printVector(result);
//             return 0;
//         }`;
//     }
//     // --- Harness for 'reverseList' ---
//     else if (functionName === 'reverseList') {
//         mainLogic = `
//         int main() {
//             string line;
//             getline(cin, line);
//             ListNode* head = parseLinkedList(line);
//             Solution sol;
//             ListNode* result = sol.reverseList(head);
//             printLinkedList(result);
//             return 0;
//         }`;
//     }
//     // --- Harness for 'maxDepth' ---
//     else if (functionName === 'maxDepth') {
//         mainLogic = `
//         int main() {
//             string line;
//             getline(cin, line);
//             TreeNode* root = parseTree(line);
//             Solution sol;
//             int result = sol.maxDepth(root);
//             cout << result << endl;
//             return 0;
//         }`;
//     }
//     // --- Harness for 'containsDuplicate' ---
//     else if (functionName === 'containsDuplicate') {
//         mainLogic = `
//         int main() {
//             string line;
//             getline(cin, line);
//             stringstream ss(line);
//             vector<int> nums;
//             int num;
//             while(ss >> num) nums.push_back(num);
//             Solution sol;
//             bool result = sol.containsDuplicate(nums);
//             cout << (result ? "true" : "false") << endl;
//             return 0;
//         }`;
//     }
//     // --- Harness for 'isPalindrome' ---
//     else if (functionName === 'isPalindrome') {
//         mainLogic = `
//         int main() {
//             int x;
//             cin >> x;
//             Solution sol;
//             bool result = sol.isPalindrome(x);
//             cout << (result ? "true" : "false") << endl;
//             return 0;
//         }`;
//     }
//     else {
//         // If no specific harness is found, throw an error to prevent silent failures.
//         throw new Error(`C++ harness for function '${functionName}' is not implemented.`);
//     }

//     return `${CPP_BOILERPLATE}\n${wrappedUserCode}\n${mainLogic}`;
// }

// function buildJavaHarness(userCode, functionName) {
//     const wrappedUserCode = `static class Solution { ${userCode} }`;
//     let mainLogic = '';

//     if (functionName === 'twoSum') {
//         mainLogic = `
//         public static void main(String[] args) {
//             Scanner sc = new Scanner(System.in);
//             int[] nums = parseIntArray(sc.nextLine());
//             int target = sc.nextInt();
//             Solution sol = new Solution();
//             int[] result = sol.twoSum(nums, target);
//             for (int i = 0; i < result.length; i++) {
//                 System.out.print(result[i] + (i == result.length - 1 ? "" : " "));
//             }
//             System.out.println();
//             sc.close();
//         }`;
//     } else if (functionName === 'containsDuplicate' || functionName === 'isPalindrome') {
//         mainLogic = `
//         public static void main(String[] args) {
//             Scanner sc = new Scanner(System.in);
//             int inputVal = sc.nextInt(); // Simplified for isPalindrome
//             // For containsDuplicate, you'd parse an array instead.
//             // This part needs to be more robust for different signatures.
//             Solution sol = new Solution();
//             // Assuming isPalindrome for this simple case.
//             boolean result = sol.isPalindrome(inputVal); 
//             System.out.println(result);
//             sc.close();
//         }`;
//     }
//     // Add other Java harnesses here...
//     else {
//         throw new Error(`Java harness for function '${functionName}' is not implemented.`);
//     }

//     return `${JAVA_BOILERPLATE}\n${wrappedUserCode}\n${mainLogic}\n}`;
// }


// function buildJsHarness(userCode, functionName) {
//     const mainLogic = `
//     function run(input) {
//         const lines = input.trim().split('\\n');
        
//         // --- Harness for 'twoSum' ---
//         if ("${functionName}" === "twoSum") {
//             const nums = lines[0].split(' ').map(Number);
//             const target = Number(lines[1]);
//             const result = ${functionName}(nums, target);
//             console.log(result.join(' '));
//         } 
//         // --- Harness for 'containsDuplicate' or 'isPalindrome' ---
//         else if ("${functionName}" === "containsDuplicate" || "${functionName}" === "isPalindrome") {
//             const inputVal = lines[0].split(' ').map(Number); // Array for containsDuplicate
//             const result = ${functionName}(inputVal.length === 1 ? inputVal[0] : inputVal); // Handle both single int and array
//             console.log(result);
//         }
//         // Add other JS harnesses here...
//         else {
//             throw new Error("JS harness for function '${functionName}' is not implemented.");
//         }
//     }

//     process.stdin.resume();
//     process.stdin.setEncoding('utf-8');
//     let stdin_input = '';
//     process.stdin.on('data', (input) => (stdin_input += input));
//     process.stdin.on('end', () => run(stdin_input));
//     `;

//     return `${JS_BOILERPLATE}\n${userCode}\n${mainLogic}`;
// }


// function buildHarness(language, userCode, functionName, problemTag) {    
//     if (language === 'cpp') {
//         return buildCppHarness(userCode, functionName); 
//     }
//     if (language === 'java') {
//         return buildJavaHarness(userCode, functionName);
//     }
//     if (language === 'javascript') {
//         return buildJsHarness(userCode, functionName);
//     }
    
//     throw new Error(`Harness generation for language '${language}' is not supported.`);
// }

// module.exports = { buildHarness };