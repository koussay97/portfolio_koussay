
### marketing
## lead gen sales funnel:

 this funnel payload: 
 ```js 
arkana_lead_state:{
  "meta": {
    "version": "1.0",
    "first_visited_at": "2026-08-22T10:15:30Z",
    "last_active_at": "2026-08-22T14:20:00Z",
    "initial_referrer": "https://linkedin.com",
    "utm": {
      "source": "linkedin",
      "medium": "post",
      "campaign": "architecture_case_study"
    }
  },
  "funnel": {
    "current_stage": "evaluation", // "awareness" | "interest" | "evaluation" | "intent" | "conversion"
    "score": 35 // Weighted cumulative score
  },
  "awareness": {
    "total_sessions": 2,
    "total_page_views": 6,
    "total_time_seconds": 340,
    "visited_pages": {
      "/": 4,
      "/blog/clean-architecture-monorepos": 2
    },
    "sections_browsed_seconds": {
      "hero": 25,
      "about": 60,
      "case_studies": 180,
      "contact": 75
    }
  },
  "interest": {
    "explored_team_philosophy": true,
    "github_repos_clicked": [
      "flutter_bloc_clean_template",
      "mqtt_desktop_runner"
    ]
  },
  "evaluation": {
    "projects_inspected": {
        "gsp_toolset_windows": {
          "screenshots_viewed": 5,
          "checked_impact": true,
          "external_links_clicked": ["github_demo", "company_website"]
        },
        "xcite_immo_saas": {
          "screenshots_viewed": 3,
          "checked_impact": true,
          "external_links_clicked": ["app_store"]
        } ... the rest of projects
    }
  },
  "intent": {
    "form_initiated": true,
    "form_topic_selected": "Architecture Audit & Consulting",
    "copied_direct_email": false,
    "time_spent_in_form_seconds": 45
  },
  "conversion": {
    "converted": true,
    "submitted_at": "2026-08-22T14:25:00Z",
    "formspree_submission_id": "xyz123"
  }
}
      ``` 




# funnel stages in Storage
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