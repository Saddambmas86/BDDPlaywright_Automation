Feature: User API

# Scenario: api_Generating auth token

# Given user sets method "POST"
# And user sets endpoint "/auth"
# And user adds header "Content-Type" as "application/json"
# And user sets payload "requestpayload"
# When user sends api request
# Then response status should be 200

# And user stores response path "reason" as "authToken"
# And user adds header "Cookie" as "$authToken"
# And  user sets method "POST"
# And user sets endpoint "/booking/3943"
# And user sets payload "updatebooking"
# When user sends api request
# Then response status should be 404 


@auth
Scenario: api_Creating users

Given user sets method "POST"
Given user sets endpoint from config "booking_create"
# And user sets endpoint "/booking"
And user adds header "Content-Type" as "application/json"
And user sets payload "createuser"
When user sends api request
Then response status should be 200
Then response path "booking.firstname" should be "JimTest"
Then response path "booking.lastname" should be "BrownTest"
Then response path "booking.totalprice" should be "885"
Then response path "booking.depositpaid" should be "true"
Then response path "booking.bookingdates.checkin" should be "2018-01-01"
Then response path "booking.bookingdates.checkout" should be "2019-01-01"
Then response path "booking.additionalneeds" should be "Lunch"



# @QATestApi
# Scenario: api_DB value in creation

# Given user fetches db value from "mysql" query "getUsername" and stores as "Username"
# And user fetches db value from "mysql" query "getpassword" and stores as "Password"
# And user sets method "POST"
# And user sets endpoint from config "booking_create"
# And user adds header "Content-Type" as "application/json"
# And user sets payload "createuser"
# When user sends api request
# Then response status should be 200
# Then response path "booking.firstname" should be "JimTest"
# Then response path "booking.lastname" should be "BrownTest"
# Then response path "booking.totalprice" should be "885"
# Then response path "booking.depositpaid" should be "true"
# Then response path "booking.bookingdates.checkin" should be "2018-01-01"
# Then response path "booking.bookingdates.checkout" should be "2019-01-01"
# Then response path "booking.additionalneeds" should be "Lunch"



# Scenario: api_Creating booking with dynamic payload replacement

# Given user fetches db value from "mysql" query "getUsername" and stores as "Username"
# And user sets method "POST"
# And user sets endpoint from config "booking_create"
# And user adds header "Content-Type" as "application/json"
# And user sets payload "createuser"
# When user replaces "firstname" in payload with stored value "$Username"
# When user replaces "lastname" in payload with stored value "Saddam"
# When user sends api request
# Then response status should be 200





