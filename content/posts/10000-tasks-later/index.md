---
title: "10,000 Tasks Later"
tags: ["todoist", "productivity", "personal"]
date: 2025-11-21T13:29:03+01:00
type: post
---
The year of high numbers concludes with a follow-up post to my [2024 Todoist review](/posts/5000-tasks-later/). The app continues to serve as my second brain and eliminates the mental load of remembering tasks. Despite being an easy recommendation for everybody searching for a productivity tool, I have noticed some shortcomings that I want to discuss here.

1. Checklists are an ideal use case for such an app. I maintain one for traveling. It includes everything I could possibly imagine. Once the list is checked-off, I can be sure to not have forgotten anything. Unfortunately, it grew quite large over time and duplicating the list would surpass Todoist's **[three hundred tasks limit](https://www.todoist.com/help/articles/usage-limits-in-todoist-e5rcSY)**, so I had to split it into multiple projects.
2. The reason for the task limit is stated as:

    > Why place a 300 active task limit? Why cap projects to 500? These limits ensure Todoist stays fast, stable, and reliable for everyone. Having too many active tasks in a single project can slow syncing down and increase the risk of performance issues. [...] That said, we're working to make our sync engine faster, so we can increase these limits.
    >
    > <cite>[Todoist help](https://www.todoist.com/help/articles/usage-limits-in-todoist-e5rcSY#h_01HA4EYZ2CKRNDTQDWT9S29KG6)</cite>

    I hope the last part is true, because **performance is lacking**, to say the least:

    | Tasks | Duplicate #1 | Duplicate #2 | Duplicate #3 |  Average |
    | ----: | -----------: | -----------: | -----------: | -------: |
    |    10 |       5.85 s |       3.60 s |       4.58 s |   4.68 s |
    |    25 |       8.15 s |      11.19 s |       7.59 s |   8.98 s |
    |    50 |      20.52 s |      15.59 s |      14.90 s |  17.00 s |
    |   100 |      29.70 s |      32.71 s |      31.72 s |  25.77 s |
    |   200 |      60.66 s |      78.19 s |      71.06 s |  69.97 s |
    |   300 |     128.09 s |     130.58 s |     109.47 s | 122.71 s |
    {.font-feature-tnum}

    That being said, I never noticed any issues outside of duplicating projects.

3. **Markdown support is limited.** I would like to see proper support on the level of GitHub. Tables and copy/paste inline images are a must, while file uploads would be nice to have. Currently, you can only add images and files by commenting on a task, which decouples them from the rest of the content.
4. [Todoist will increase its annual price](https://www.todoist.com/help/articles/todoist-pricing-and-plans-update-2025-everything-you-need-to-know-Tn6Pg1JKI) from €48 to €60. This won't hurt my bottom line, and I think the price is fair for the amount I use it. I support their [vision](https://doist.com/how-we-work/no-exit-strategy) of being a sustainable company without an exit strategy through acquisition or IPO. I worry, however, about the way this additional money is spent on [AI features](https://www.todoist.com/help/articles/dictate-to-add-tasks-with-ramble-P1Raq7vVF) [nobody asked for](https://www.reddit.com/r/todoist/comments/1oq25gr/anyone_else_considering_leaving_todoist_after/) instead of focusing on community feedback.

Despite my criticism, I will continue to be a content customer of Todoist. I hope they realign with their community and steer away from unnecessary AI integration. Focusing on performance and polishing existing features would elevate this app to the next level. Post done --- another task completed.
