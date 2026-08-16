import { Difficulty, HeatmapDay, Language, LeaderboardEntry, Problem, Quest, Rank, Submission, User } from "@/types";

export const XP_REWARDS: Record<Difficulty, number> = {
  Easy: 20,
  Medium: 60,
  Hard: 120,
};

export const RANK_THRESHOLDS: Record<Rank, number> = {
  Bronze: 0,
  Silver: 500,
  Gold: 1500,
  Diamond: 3500,
  Legend: 7000,
};

export const RANK_COLORS: Record<Rank, string> = {
  Bronze: "text-amber-600",
  Silver: "text-slate-400",
  Gold: "text-yellow-400",
  Diamond: "text-cyan-400",
  Legend: "text-purple-400",
};

export const RANK_BG: Record<Rank, string> = {
  Bronze: "from-amber-900/40 to-amber-700/20",
  Silver: "from-slate-700/40 to-slate-500/20",
  Gold: "from-yellow-900/40 to-yellow-600/20",
  Diamond: "from-cyan-900/40 to-cyan-600/20",
  Legend: "from-purple-900/40 to-purple-600/20",
};

export const STREAK_THEMES = {
  fire: { icon: "🔥", color: "from-orange-500 to-red-600", glow: "shadow-orange-500/50" },
  ice: { icon: "❄️", color: "from-blue-400 to-cyan-600", glow: "shadow-cyan-400/50" },
  galaxy: { icon: "🌌", color: "from-purple-500 to-indigo-700", glow: "shadow-purple-500/50" },
};

export function getRankFromXP(xp: number): Rank {
  if (xp >= 7000) return "Legend";
  if (xp >= 3500) return "Diamond";
  if (xp >= 1500) return "Gold";
  if (xp >= 500) return "Silver";
  return "Bronze";
}

export function getXPToNextRank(xp: number): { current: number; next: number; rank: Rank } {
  const rank = getRankFromXP(xp);
  const thresholds = Object.values(RANK_THRESHOLDS);
  const ranks = Object.keys(RANK_THRESHOLDS) as Rank[];
  const idx = ranks.indexOf(rank);
  const current = thresholds[idx];
  const next = thresholds[idx + 1] ?? thresholds[idx];
  return { current, next, rank };
}

export const MOCK_SUBMISSIONS: Submission[] = [
  { id: "s1", problemId: "1", problemTitle: "Two Sum", status: "Accepted", language: "javascript", runtime: "72ms", memory: "42.1MB", timestamp: "2024-12-10T10:30:00Z", xpEarned: 20 },
  { id: "s2", problemId: "2", problemTitle: "Valid Parentheses", status: "Accepted", language: "python", runtime: "45ms", memory: "16.2MB", timestamp: "2024-12-09T14:20:00Z", xpEarned: 20 },
  { id: "s3", problemId: "3", problemTitle: "Longest Substring Without Repeating Characters", status: "Wrong Answer", language: "javascript", runtime: "—", memory: "—", timestamp: "2024-12-08T09:15:00Z", xpEarned: 0 },
  { id: "s4", problemId: "4", problemTitle: "Binary Tree Level Order Traversal", status: "Accepted", language: "cpp", runtime: "8ms", memory: "23.4MB", timestamp: "2024-12-07T16:45:00Z", xpEarned: 60 },
  { id: "s5", problemId: "6", problemTitle: "Coin Change", status: "Accepted", language: "python", runtime: "312ms", memory: "14.8MB", timestamp: "2024-12-06T11:00:00Z", xpEarned: 60 },
  { id: "s6", problemId: "5", problemTitle: "Word Ladder", status: "Time Limit Exceeded", language: "javascript", runtime: "—", memory: "—", timestamp: "2024-12-05T20:30:00Z", xpEarned: 0 },
];

export const MOCK_USER: User = {
  id: "1",
  username: "DragonCoder",
  avatar: "🐉",
  rank: "Gold",
  level: 14,
  xp: 2340,
  xpToNext: 3500,
  coins: 850,
  streak: 12,
  streakTheme: "fire",
  skills: { DP: 6, Graphs: 4, Trees: 7, Greedy: 3, "Binary Search": 5, Strings: 4, Arrays: 8, Math: 2 },
  solvedProblems: ["1", "2", "4", "6"],
  joinedAt: "2024-01-15",
  submissions: MOCK_SUBMISSIONS,
  acceptanceRate: 67,
};

export const STARTER_CODE: Record<string, Partial<Record<Language, string>>> = {
  "1": {
    javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n  \n};`,
    python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        `,
    cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`,
    java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}`,
  },
  "2": {
    javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n  \n};`,
    python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        `,
    cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};`,
    java: `class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}`,
  },
};

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: "1", title: "Two Sum", difficulty: "Easy", tags: ["Arrays"],
    xpReward: 20, coinReward: 5, solved: true, acceptanceRate: 49.1, totalSubmissions: 14200000,
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    hints: ["A really brute force way would be to search for all possible pairs of numbers.", "Try to use a hash map to reduce time complexity."],
    companies: ["Google", "Amazon", "Meta", "Apple", "Microsoft"],
    starterCode: STARTER_CODE["1"],
  },
  {
    id: "2", title: "Valid Parentheses", difficulty: "Easy", tags: ["Greedy"],
    xpReward: 20, coinReward: 5, solved: true, acceptanceRate: 40.7, totalSubmissions: 5800000,
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n- Open brackets must be closed by the same type of brackets.\n- Open brackets must be closed in the correct order.\n- Every close bracket has a corresponding open bracket of the same type.",
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    hints: ["Use a stack to keep track of opening brackets."],
    companies: ["Amazon", "Bloomberg", "Google"],
    starterCode: STARTER_CODE["2"],
  },
  {
    id: "3", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", tags: ["Strings"],
    xpReward: 60, coinReward: 15, solved: false, acceptanceRate: 33.8, totalSubmissions: 9100000,
    description: "Given a string s, find the length of the longest substring without duplicate characters.",
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1" },
    ],
    hints: ["Use a sliding window approach.", "Use a hash set to track characters in the current window."],
    companies: ["Amazon", "Bloomberg", "Adobe"],
    starterCode: {
      javascript: `var lengthOfLongestSubstring = function(s) {\n  \n};`,
      python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        `,
    },
  },
  {
    id: "4", title: "Binary Tree Level Order Traversal", difficulty: "Medium", tags: ["Trees"],
    xpReward: 60, coinReward: 15, solved: true, acceptanceRate: 65.2, totalSubmissions: 3200000,
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    constraints: ["The number of nodes in the tree is in the range [0, 2000].", "-1000 <= Node.val <= 1000"],
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
      { input: "root = [1]", output: "[[1]]" },
    ],
    hints: ["Use BFS with a queue."],
    companies: ["Amazon", "Microsoft", "Facebook"],
    starterCode: {
      javascript: `var levelOrder = function(root) {\n  \n};`,
      python: `class Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        `,
    },
  },
  {
    id: "5", title: "Word Ladder", difficulty: "Hard", tags: ["Graphs"],
    xpReward: 120, coinReward: 30, solved: false, acceptanceRate: 37.4, totalSubmissions: 1800000,
    description: "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that every adjacent pair of words differs by a single letter, and every si for 1 <= i <= k is in wordList.",
    constraints: ["1 <= beginWord.length <= 10", "endWord.length == beginWord.length", "1 <= wordList.length <= 5000"],
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5" },
    ],
    hints: ["Use BFS.", "Build a graph where each word is connected to its neighbors."],
    companies: ["Amazon", "LinkedIn", "Snapchat"],
    starterCode: {
      javascript: `var ladderLength = function(beginWord, endWord, wordList) {\n  \n};`,
      python: `class Solution:\n    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:\n        `,
    },
  },
  {
    id: "6", title: "Coin Change", difficulty: "Medium", tags: ["DP"],
    xpReward: 60, coinReward: 15, solved: true, acceptanceRate: 42.8, totalSubmissions: 4500000,
    description: "You are given an integer array coins representing coins of various denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    examples: [
      { input: "coins = [1,5,10], amount = 11", output: "2" },
      { input: "coins = [2], amount = 3", output: "-1" },
    ],
    hints: ["Think of it as a DP problem.", "dp[i] = minimum coins to make amount i."],
    companies: ["Amazon", "Google", "Microsoft"],
    starterCode: {
      javascript: `var coinChange = function(coins, amount) {\n  \n};`,
      python: `class Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        `,
    },
  },
  {
    id: "7", title: "Median of Two Sorted Arrays", difficulty: "Hard", tags: ["Binary Search"],
    xpReward: 120, coinReward: 30, solved: false, acceptanceRate: 38.9, totalSubmissions: 3900000,
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000"],
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "merged array = [1,2,3] and median is 2." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000" },
    ],
    hints: ["Use binary search on the smaller array."],
    companies: ["Google", "Amazon", "Apple", "Microsoft"],
    starterCode: {
      javascript: `var findMedianSortedArrays = function(nums1, nums2) {\n  \n};`,
      python: `class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        `,
    },
  },
  {
    id: "8", title: "Number of Islands", difficulty: "Medium", tags: ["Graphs"],
    xpReward: 60, coinReward: 15, solved: false, acceptanceRate: 57.3, totalSubmissions: 4100000,
    description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300"],
    examples: [
      { input: 'grid = [["1","1","0"],["0","1","0"],["0","0","1"]]', output: "2" },
    ],
    hints: ["Use DFS or BFS to explore each island.", "Mark visited cells to avoid counting them twice."],
    companies: ["Amazon", "Bloomberg", "Google", "Microsoft"],
    starterCode: {
      javascript: `var numIslands = function(grid) {\n  \n};`,
      python: `class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        `,
    },
  },
  {
    id: "9", title: "Climbing Stairs", difficulty: "Easy", tags: ["DP"],
    xpReward: 20, coinReward: 5, solved: false, acceptanceRate: 51.8, totalSubmissions: 5200000,
    description: "You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    constraints: ["1 <= n <= 45"],
    examples: [
      { input: "n = 2", output: "2", explanation: "There are two ways to climb to the top: 1+1 and 2." },
      { input: "n = 3", output: "3" },
    ],
    hints: ["This is essentially a Fibonacci sequence."],
    companies: ["Amazon", "Apple", "Adobe"],
    starterCode: {
      javascript: `var climbStairs = function(n) {\n  \n};`,
      python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        `,
    },
  },
  {
    id: "10", title: "Merge K Sorted Lists", difficulty: "Hard", tags: ["Trees"],
    xpReward: 120, coinReward: 30, solved: false, acceptanceRate: 50.1, totalSubmissions: 2800000,
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
    constraints: ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500"],
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
    ],
    hints: ["Use a min-heap (priority queue).", "Divide and conquer approach also works."],
    companies: ["Amazon", "Google", "Microsoft", "Uber"],
    starterCode: {
      javascript: `var mergeKLists = function(lists) {\n  \n};`,
      python: `class Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        `,
    },
  },
  {
    id: "11", title: "Maximum Subarray", difficulty: "Medium", tags: ["DP", "Greedy"],
    xpReward: 60, coinReward: 15, solved: false, acceptanceRate: 50.4, totalSubmissions: 6700000,
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
    ],
    hints: ["Use Kadane's algorithm."],
    companies: ["Amazon", "Apple", "LinkedIn"],
    starterCode: {
      javascript: `var maxSubArray = function(nums) {\n  \n};`,
      python: `class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        `,
    },
  },
  {
    id: "12", title: "LRU Cache", difficulty: "Medium", tags: ["Arrays"],
    xpReward: 60, coinReward: 15, solved: false, acceptanceRate: 41.6, totalSubmissions: 3100000,
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the LRUCache class with get and put operations in O(1) time complexity.",
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5"],
    examples: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: "[null,null,null,1,null,-1,null,-1,3,4]" },
    ],
    hints: ["Use a combination of HashMap and Doubly Linked List."],
    companies: ["Amazon", "Google", "Microsoft", "Facebook"],
    starterCode: {
      javascript: `class LRUCache {\n  constructor(capacity) {\n    \n  }\n  get(key) {\n    \n  }\n  put(key, value) {\n    \n  }\n}`,
      python: `class LRUCache:\n    def __init__(self, capacity: int):\n        \n    def get(self, key: int) -> int:\n        \n    def put(self, key: int, value: int) -> None:\n        `,
    },
  },
  {
    id: "13", title: "Reverse Linked List", difficulty: "Easy", tags: ["Trees"],
    xpReward: 20, coinReward: 5, solved: false, acceptanceRate: 73.1, totalSubmissions: 3900000,
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    constraints: ["The number of nodes in the list is the range [0, 5000].", "-5000 <= Node.val <= 5000"],
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
    ],
    hints: ["Use iterative two pointers or recursive approach."],
    companies: ["Apple", "Amazon", "Facebook", "Microsoft"],
    starterCode: {
      javascript: `var reverseList = function(head) {\n  \n};`,
      python: `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        `,
    },
  },
  {
    id: "14", title: "Merge Intervals", difficulty: "Medium", tags: ["Arrays", "Greedy"],
    xpReward: 60, coinReward: 15, solved: false, acceptanceRate: 46.2, totalSubmissions: 4100000,
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    constraints: ["1 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= starti <= endi <= 10^4"],
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
    ],
    hints: ["Sort the intervals by their start times."],
    companies: ["Google", "Bloomberg", "Amazon"],
    starterCode: {
      javascript: `var merge = function(intervals) {\n  \n};`,
      python: `class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        `,
    },
  },
  {
    id: "15", title: "Contains Duplicate", difficulty: "Easy", tags: ["Arrays"],
    xpReward: 20, coinReward: 5, solved: false, acceptanceRate: 61.2, totalSubmissions: 4200000,
    description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    examples: [
      { input: "nums = [1,2,3,1]", output: "true" },
    ],
    hints: ["Use a Set to keep track of seen elements."],
    companies: ["Amazon", "Google", "Apple"],
    starterCode: {
      javascript: `var containsDuplicate = function(nums) {\n  \n};`,
      python: `class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        `,
    },
  },
  {
    id: "16", title: "Trapping Rain Water", difficulty: "Hard", tags: ["Arrays", "DP", "Greedy"],
    xpReward: 120, coinReward: 30, solved: false, acceptanceRate: 59.8, totalSubmissions: 3100000,
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "6 units of rain water are being trapped." },
    ],
    hints: ["Two pointers approach from left and right reduces space complexity to O(1)."],
    companies: ["Amazon", "Goldman Sachs", "Google"],
    starterCode: {
      javascript: `var trap = function(height) {\n  \n};`,
      python: `class Solution:\n    def trap(self, height: List[int]) -> int:\n        `,
    },
  },
  {
    id: "17", title: "Group Anagrams", difficulty: "Medium", tags: ["Strings", "Arrays"],
    xpReward: 60, coinReward: 15, solved: false, acceptanceRate: 67.2, totalSubmissions: 3300000,
    description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."],
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    ],
    hints: ["Sort each string to use as a key in a hash map."],
    companies: ["Amazon", "Microsoft", "Uber"],
    starterCode: {
      javascript: `var groupAnagrams = function(strs) {\n  \n};`,
      python: `class Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        `,
    },
  },
  {
    id: "18", title: "Valid Palindrome", difficulty: "Easy", tags: ["Strings"],
    xpReward: 20, coinReward: 5, solved: false, acceptanceRate: 45.7, totalSubmissions: 4800000,
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.",
    constraints: ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
    ],
    hints: ["Use two pointers moving inwards from both ends."],
    companies: ["Meta", "Amazon", "Spotify", "Microsoft"],
    starterCode: {
      javascript: `var isPalindrome = function(s) {\n  \n};`,
      python: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        `,
    },
  }
];

export const MOCK_QUESTS: Quest[] = [
  { id: "q1", title: "Daily Grind", description: "Solve 3 Easy problems today", xpReward: 200, coinReward: 50, progress: 2, total: 3, completed: false, type: "daily", icon: "⚡" },
  { id: "q2", title: "Speed Demon", description: "Solve a problem in under 5 minutes", xpReward: 150, coinReward: 30, progress: 0, total: 1, completed: false, type: "daily", icon: "🏃" },
  { id: "q3", title: "Weekly Warrior", description: "Solve 10 problems this week", xpReward: 800, coinReward: 200, progress: 4, total: 10, completed: false, type: "weekly", icon: "⚔️" },
  { id: "q4", title: "Graph Master", description: "Solve 3 Graph problems", xpReward: 500, coinReward: 120, progress: 1, total: 3, completed: false, type: "weekly", icon: "🕸️" },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: { id: "2", username: "NightOwlDev", avatar: "🦉", level: 28, xp: 8200, rank: "Legend" }, solvedCount: 312, streak: 45, acceptanceRate: 78 },
  { rank: 2, user: { id: "3", username: "ByteWizard", avatar: "🧙", level: 24, xp: 6800, rank: "Diamond" }, solvedCount: 278, streak: 30, acceptanceRate: 72 },
  { rank: 3, user: { id: "4", username: "CodePhoenix", avatar: "🦅", level: 21, xp: 5400, rank: "Diamond" }, solvedCount: 241, streak: 22, acceptanceRate: 69 },
  { rank: 4, user: { id: "1", username: "DragonCoder", avatar: "🐉", level: 14, xp: 2340, rank: "Gold" }, solvedCount: 156, streak: 12, acceptanceRate: 67 },
  { rank: 5, user: { id: "5", username: "IronScript", avatar: "⚔️", level: 11, xp: 1800, rank: "Silver" }, solvedCount: 134, streak: 8, acceptanceRate: 61 },
  { rank: 6, user: { id: "6", username: "PixelKnight", avatar: "🛡️", level: 9, xp: 1200, rank: "Silver" }, solvedCount: 98, streak: 5, acceptanceRate: 58 },
  { rank: 7, user: { id: "7", username: "StormCaster", avatar: "⚡", level: 7, xp: 820, rank: "Silver" }, solvedCount: 76, streak: 3, acceptanceRate: 54 },
  { rank: 8, user: { id: "8", username: "AlgoNinja", avatar: "🥷", level: 5, xp: 620, rank: "Silver" }, solvedCount: 58, streak: 2, acceptanceRate: 50 },
  { rank: 9, user: { id: "9", username: "DataDruid", avatar: "🧝", level: 4, xp: 380, rank: "Bronze" }, solvedCount: 34, streak: 1, acceptanceRate: 45 },
  { rank: 10, user: { id: "10", username: "BinaryBard", avatar: "🎭", level: 2, xp: 180, rank: "Bronze" }, solvedCount: 18, streak: 0, acceptanceRate: 40 },
];

export function generateHeatmap(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const rand = Math.random();
    days.push({
      date: d.toISOString().split("T")[0],
      count: rand > 0.6 ? Math.floor(rand * 6) : 0,
    });
  }
  return days;
}
