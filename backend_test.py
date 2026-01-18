#!/usr/bin/env python3
"""
Backend API Testing for Claude for Mayor
Tests all endpoints with the public URL
"""
import requests
import json
import sys
import time
from datetime import datetime

class ClaudeForMayorTester:
    def __init__(self, base_url="https://claude-for-mayor-a7i9a.ondigitalocean.app"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = f"test-session-{int(time.time())}"

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 200:
                        print(f"   Response: {response_data}")
                    else:
                        print(f"   Response received (length: {len(str(response_data))})")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timed out after {timeout}s")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_chat(self):
        """Test chat functionality"""
        return self.run_test(
            "Chat with Claude",
            "POST",
            "api/chat",
            200,
            data={
                "session_id": self.session_id,
                "message": "What is the current status of the US Congress?"
            },
            timeout=45  # AI responses can take longer
        )

    def test_fact_check(self):
        """Test fact checking"""
        return self.run_test(
            "Fact Check",
            "POST",
            "api/fact-check",
            200,
            data={
                "claim": "The US Congress has 535 voting members",
                "source_type": "statement"
            },
            timeout=45
        )

    def test_x_post_analysis(self):
        """Test X post analysis"""
        return self.run_test(
            "X Post Analysis",
            "POST",
            "api/analyze-x-post",
            200,
            data={
                "post_content": "Breaking: New infrastructure bill passed with bipartisan support!",
                "author": "test_user"
            },
            timeout=45
        )

    def test_leader_updates_all(self):
        """Test leader updates - all parties"""
        return self.run_test(
            "Leader Updates (All)",
            "GET",
            "api/leader-updates",
            200,
            timeout=45
        )

    def test_leader_updates_democratic(self):
        """Test leader updates - Democratic party"""
        return self.run_test(
            "Leader Updates (Democratic)",
            "GET",
            "api/leader-updates?party=Democratic",
            200,
            timeout=45
        )

    def test_leader_updates_republican(self):
        """Test leader updates - Republican party"""
        return self.run_test(
            "Leader Updates (Republican)",
            "GET",
            "api/leader-updates?party=Republican",
            200,
            timeout=45
        )

    def test_political_calendar(self):
        """Test political calendar"""
        return self.run_test(
            "Political Calendar",
            "GET",
            "api/political-calendar",
            200,
            timeout=45
        )

    def test_recent_fact_checks(self):
        """Test recent fact checks endpoint"""
        return self.run_test(
            "Recent Fact Checks",
            "GET",
            "api/recent-fact-checks",
            200
        )

    def test_chat_history(self):
        """Test chat history endpoint"""
        return self.run_test(
            "Chat History",
            "GET",
            f"api/chat-history/{self.session_id}",
            200
        )

def main():
    print("🚀 Starting Claude for Mayor Backend API Tests")
    print("=" * 60)
    
    tester = ClaudeForMayorTester()
    
    # Test all endpoints
    tests = [
        tester.test_health,
        tester.test_chat,
        tester.test_fact_check,
        tester.test_x_post_analysis,
        tester.test_leader_updates_all,
        tester.test_leader_updates_democratic,
        tester.test_leader_updates_republican,
        tester.test_political_calendar,
        tester.test_recent_fact_checks,
        tester.test_chat_history
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
        
        # Small delay between tests
        time.sleep(1)
    
    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 BACKEND TEST SUMMARY")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print("⚠️  Some backend tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())