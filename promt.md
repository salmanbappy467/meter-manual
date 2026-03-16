#একটি প্রযেক্ট তৈরি জন্য protype দাও 
*প্রযেক্ট টি হবে এরকম সমস্ত মিটারের Manual ও specification এর datahub হবে এটি mongodb,next.js,imagebb, pbsnet-worker api for auth ব্যবহার করবে

 *যে কোন মিটার manual এর specification যেকোন ব্যবহারকারি যুক্ত করতে পারবে এবং admin তা approve করলে তা পাবলিক সবাই দেখতে পারবে 
  specification এ থাকবে meter manufacturer, types,Item,id-note, accrecy clas, error class, terminal point,
   base info, standerds,workoredrs,
  manufacturer years, meter serials number ranges(start,end),waranty priord, meter prise(mf,prise), Rate info,
   Demand-info,kvar-info,prepaid-info,network-info, net-meterinfo

    *manufacturer, types,Item একটি আর অন্য গুলো একাধিক লাইন হতে পারে
    *number ranges(start,end) একাধিক সিরিয়াল হতে পারে যেমন (500000-800000 ও 900000-950000)
 *এবং এখানে manufacturer,Item code,types,meter serials number এর উপর ভিত্তি করে data search করতে পারবে সবাই লগ ইন কর ছাড়াও public থাকবে। এবং প্রতি মিটারের একটি public link,public json link হবে যা দ্বার সেই মিটারের তথ্যগুলো দেখতে পারবে ।
 
 
 #প্রতি মিটারে manual একাধিক  display manual list যেকোন ব্যবহারকারি যুক্ত করতে পারবে এবং তা admin aproved করলে public হবে
   display list এ কলাম থাকবে sl no, id number,display. Unit,Parameter Name.Parameter details, Remarks এবং
   একাধিক রো একিট display list এ যুক্ত থাকতে পারে 


যোকোন ব্যাক্তি নতুন display manual ও নতুন মিটার manual যুক্ত করতে পারবে এবং admin aprove করবে
এবং যেকোন ব্যাক্তি তার display list অথবা meter manual edit করতে পারবে এবং সে দেখতে পারবে admin aprove ছাড়া কিন্তু সেটা public করবে শুধু admin

admin তার dashboard এ সব কিছু edit করতে পারবে এবং যুক্ত করতে পারবে এবং সমস্ত ব্যবহারকারির কাজ accept , edit , aprove , delete করতে পারবে


## home page হবে search option থাকবে যেখানে meter number দিলে যে serialrange এর মধ্য পরবে সে meter card(manufacturer,types,Item,id-note) এর লিস্ট গুলো আসবে এবং card এ click করলে meter manual পেজ open হবে  -> অন্যান specification তথ্য দিয়েও search করলে আসেব
এবং Item , manufacturer দিয়েও ফিল্টার করতে পারবে

এবং উপরে login , login user এর জন্য  add meter manual,  my meter 

## meter manual page >> উপরে গ্রিড আকারে specification গুলো থাকবে এর নিচে specification যে যে যুক্ত বা পরিবর্তন  করেছে তার নাম,profile pic সহ pbs name লিস্ট থাকবে এক কলামে আবদান কলাম সংক্ষিপ্ত ভাবে
    এর নিচে 2 টি সেই মিটারের display manual থাকবে এবং আরো যদি থাকে তাহলে more button থাকবে এবং
    এবং প্রতি  display manual like করতে পারবে যে display manual বেশি like পেয়েছে সেটা উপরে থাকবে
    এবং প্রতি display manual এর নিচে যে display manual creator এর প্রফাইল থাকবে

    নিচে একটি picture যুক্ত করার অপশন থাকবে যেকেউ পিকাচারু যুক্ত করতে পারবে তা admin aprove হলে সেখানে দেখা যাবে
    উপরে add display manual option থাকবে login user এর জন্য শুধু মাত্র login user ই like করতে পারবে
    প্রতি meter manual এর একটি public url থাকবে এবং একটি json public url থাকবে


api key for authention >> here admin username is : salmanmeter
 and api key docomention >> ### ফাইল ২: `documentation.txt`
এটি API ব্যবহারের সম্পূর্ণ নিয়মাবলী। ফ্রন্টএন্ড ডেভেলপারদের জন্য এটি খুবই জরুরি।

```text
==================================================
        PBSNet Admin API Documentation
==================================================

Base URL: https://pbsnet-admin.আপনার-নাম.workers.dev
Status: Live
Authentication Type: Header Token

--------------------------------------------------
1. AUTHENTICATION (নিরাপত্তা)
--------------------------------------------------
প্রতিটি রিকোয়েস্টে হেডার অংশে গোপন টোকেন পাঠাতে হবে।
টোকেন ভুল হলে সার্ভার "403 Access Denied" রিটার্ন করবে।

Header Key:       x-admin-secret
Header Value:     AdminSecret12345  (wrangler.toml এ যা সেট করেছেন)
Content-Type:     application/json

--------------------------------------------------
2. ENDPOINTS (এন্ডপয়েন্ট সমূহ)
--------------------------------------------------

[A] ব্যবহারকারীর ডাটা দেখা (VIEW DATA)
    URL:     /view
    Method:  POST
    
    বিবরণ: নির্দিষ্ট ইউজারের API Key দিয়ে তার প্রোফাইল এবং সিস্টেম ডাটা দেখা।

    Request Body Parameters:
    ------------------------
    1. target_user_key (String, Required)
       - ব্যবহারকারীর ইউনিক API Key (যেমন: "pbsnet-xxxx").
       
    2. subclass (String, Optional)
       - যদি পুরো ডাটা না এনে শুধু নির্দিষ্ট সেকশন (যেমন: "billing") আনতে চান।
    
    Success Response (JSON):
    ------------------------
    {
      "full_name": "Salman Bappy",
      "username": "salman467",
      "personal_json": { ... },
      "app_json": {
         "billing": { "status": "paid" },
         "network": { "ip": "192.168.1.1" }
      }
    }

---

[B] ডাটা আপডেট করা (UPDATE DATA)
    URL:     /update
    Method:  PATCH
    
    বিবরণ: নির্দিষ্ট সাব-ক্লাস বা ক্যাটাগরির ডাটা আপডেট করা। এটি আগের ডাটা মুছে ফেলে না, বরং নতুন ডাটার সাথে মার্জ (Merge) করে।

    Request Body Parameters:
    ------------------------
    1. target_user_key (String, Required)
       - যার ডাটা আপডেট করবেন তার API Key.
       
    2. subclass (String, Required)
       - ডাটার ক্যাটাগরি নাম (যেমন: "billing", "logs", "permission").
       
    3. data (Object, Required)
       - যে তথ্যগুলো সেভ করতে চান।

    উদাহরণ Body:
    -------------
    {
      "target_user_key": "pbsnet-user-01",
      "subclass": "billing",
      "data": {
        "status": "due",
        "amount": 500,
        "last_updated": "2026-02-04"
      }
    }

    Success Response (JSON):
    ------------------------
    {
      "message": "Updated successfully for 'billing'",
      "updated_data": {
        "status": "due",
        "amount": 500,
        "last_updated": "2026-02-04"
      }
    }

--------------------------------------------------
3. ERROR CODES (সম্ভাব্য এরর)
--------------------------------------------------
- 400 Bad Request: রিকোয়েস্ট বডিতে ডাটা বা সাব-ক্লাস মিসিং।
- 403 Forbidden: x-admin-secret ভুল বা দেওয়া হয়নি।
- 404 Not Found: ভুল target_user_key দেওয়া হয়েছে।
- 500 Server Error: ডাটাবেস কানেকশন বা সার্ভারে সমস্যা।

--------------------------------------------------
4. JAVASCRIPT FETCH EXAMPLE (কোড উদাহরণ)
--------------------------------------------------

const updateBilling = async () => {
  const url = "https://pbsnet-admin.salmanbappy467.workers.dev/update";
  
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": "AdminSecret12345"
    },
    body: JSON.stringify({
      target_user_key: "pbsnet-target-key",
      subclass: "billing",
      data: {
        status: "paid",
        verified: true
      }
    })
  });

  const result = await response.json();
  console.log(result);
};



