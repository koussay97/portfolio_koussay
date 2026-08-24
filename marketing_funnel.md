
### marketing
## lead gen sales funnel:

how this works:
as soon as the user lands on our website, a cookie will be set after obtaining the user's consent, 
this cookie will always be overridden based on events, and the payload is cumulative.
meaning, 
`global_data_layer_obtained_from_GA4` will always be there, + at the first visit, we will override it with `awareness` cookie with this extra data, 
this cookie will be constantly updated by the website, on every engament, [or let gtm handles the update]
same thing for the other cookies, override with a new cookie name holding the previous cookie data + the new kookie payload. 


- global_data_layer_obtained_from_GA4{
    ga4_user_id: applicable
    location: if applicable   
    age: if applicable
    gender: if applicable
}
  ==> this part payload will be must exist in all of the funnel cookies, 

# funnel stages in cookies
- awareness : score 1 
    => the user knows who we are

    payload to be appended 
    awareness: {
        total_number_of_website_views: int incremental # 1 session should fire onece, thats why we need cookies to protect ourselves from refreshes

        total_time_spent_on_website: hours, minutes, seconds, incremental
     
        visited_pages: [{page_id: number_of_visits}] # we will include a nested an html blog post into our website and we will update it constantly, so we would want to know which blogs the user read.   
     
        sections_browsed_through:[{website/section_id: time_in_seconds}] #cumulative
    }
    this payload requires constant updating while the user is interacting with our website

- interrest : score 2
    => the user is interested in our work: 
        - checked our opensource work
        - checked our about section in detail, mainly clicked on explore team members 'because that section shows a bit of my phelosophy'

    interrest :{
        opensource_repository_clicked: [project_name]
    }

- evaluation: score 3
    => the user is viewing our previous professionnal work
    evaluation: [
        { 
            project_id : {
                number_screenshots_viewd: int,
                checked_impact: bool,
                external_links_clicked: [link_id] could be ios, andoid, company_website, or request a demo
            }
        }
    ]
- intent: score 4
  => the user interacted with our form 
    evaluation: {
        topic: including requesting demo,
        wrote_something: bool
    }

 
- conversion: 
    => the user submitted a form with a topic other than request a review

    ==> send the user ga4id in the form with formspree forms.
    conversion:{ date: datetime } 