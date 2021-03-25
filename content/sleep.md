---
title: "About Sleep"
author: "Julian Smolka"
summary: "Thoughts about Why We Sleep by Matthew Walker."
date: 2020-03-27
type: post
draft: true
---

> If sleep does not serve an absolutely vital function, then it is the biggest mistake the evolutionary process ever made. - Dr. Allan Rechtschaffen

During the last months I have read the book Why We Sleep twice. Its author, [Matthew Walker](https://en.wikipedia.org/wiki/Matthew_Walker_(scientist)), is a British scientist and professor of neuroscience and psychology. In his book he tries to explain the various stages of sleep and their impact on the body in a scientific way. Even though Walker tries to follow a scientific methodology, most of his claims lack citations of the papers in question which led to valid [criticism](https://guzey.com/books/why-we-sleep/).

Some of the most interesting sections in the book are not about sleep itself but a lack thereof. When talking to other people about the importance of sleep I found it difficult to remember facts about the negative impact of too little sleep on your overall health. This was my main motivation to read the book a second time and mark everything interesting and disturbing I come across. In this post I want to connect the facts stated with the studies they originated from.

### Terminology

Before starting with the article itself, I want to explain some of the most important terms used throughout.

<!-- Todo: write -->
#### REM / NREM Sleep

- definition
- difference
- purpose
- diagram

<!-- Todo: write -->
#### Circadian Rhythm

<!-- https://www.cell.com/current-biology/fulltext/S0960-9822(06)02609-1?_returnURL=https%3A%2F%2Flinkinghub.elsevier.com%2Fretrieve%2Fpii%2FS0960982206026091%3Fshowall%3Dtrue -->
- definition (1.1, 1.3 in [^morris-cm] looks good)
- circa-diem, approx. 24h
- diagram (maybe with sleep pressure)

<!-- Todo: write -->
#### Sleep Measurement

- sleep deprivation
- sleep efficiency
- sleep latency

<!-- Todo: write -->
#### Chronotypes
- larks
- owls

### Circadian Misalignment

> The term "circadian misalignment" describes a variety of circumstances, such as inappropriately timed sleep and wake, misalignment of sleep / wake with feeding rhythms, or misaligned central and peripheral rhythms [^morris-cm].

Disturbances of the circadian rhythm can be caused by various intrinsic and extrinsic circumstances. Examples are shift work, DST, sleep disorders or the chronotype of a person.

- [^morris-cm]
  - disruption through extrinsic factors like shift work, DST and jet lag or intrinsic factors like circadian disorders, sleep disorders and chronotype
  - disruption associated with physical and psychiatric consequences

<!-- https://www.pnas.org/content/113/10/E1402 -->
<!-- https://link.springer.com/article/10.1007/s11739-018-1900-4 -->
<!--
http://www.medicine.mcgill.ca/epidemiology/hanley/communicationCommunicationCommunication/nejm199604043341416.pdf
Major disasters, including the nuclear accident at Chernobyl, the Exxon Valdez oil
spill, and the destruction of the space shuttle Challenger, have
been linked to insufficient sleep, disrupted circadian rhythms,
or both on the part of involved supervisors and staff.2,3
 -->

- circadian rhythm misalignments cause
  - increase in systolic and diastolic blood pressure
  - decreased heart rate during wake and increased heart rate during sleep periods
  - reduce the sleep opportunity-associated dip in blood pressure and heart rate
  - affect the 24h urinary epinephrine and norepinephrine excretion rates
  - decrease markers of cardiac vagal modulation
  - increased prevalence of CV disease in night workers versus day workers
  - modest sleep deprivation / reduced sleep efficiency?

### Daylight Saving Time
Daylight saving time (DST) is a topical phenomenon to explore, having just woken up from a night with one less hour of sleep than usual. In his book, Walker devotes merely one paragraph to this topic and states that the rate of heart attacks (acute myocardial infarction, AMI) increases the day after the spring shift (transition to DST, losing one hour) and decreases the day following the autumn shift (transition from DST, gaining one hour). Unfortunately he doesn't provide any concrete values or proof to back up his claims.

The first important fact when talking about the negative effects of DST is the actual amount of sleep lost per night. A study in high school students has demonstrated that this value averages 32 minutes during the workweek while weekends remain unchanged. In addition, there were no statistically relevant changes in sleep efficiency or latency [^medina-dst]. A different study focused on workplace injuries arrived at 40 minutes of lost sleep per night [^barnes-dst]. To be fair those 40 minutes excluded the sleep on weekends, which remained unaffected by the transition.

An article published in 2018 compared six papers and noticed a 4 to 29 percent increased risk of AMI during the first week of the spring shift. For the autumn shift, only one of the studies noticed a 44 percent increase of AMI cases compared to the 1 to 29 percent decrease in the remaining ones. The article concludes that there exists an association between DST and a modest increase of AMI occurrence during the spring shift [^manfredini-dst].

Another study examined the German MONICA / KORA Myocardial Infarction Registry with a sample size of 25,499 cases of coronary deaths and non-fatal AMI in individuals aged 25 to 74. It arrives at similar results like the previous article. The rate of AMI increased by 11 percent in the week following the spring shift to DST and decreased by less than one percent in the week after the autumn shift in September [^kirchberger-dst].

An article published in the New English Journal of Medicine analyzed 1,398,784 traffic accidents in Canada during the years 1991 and 1992. The accidents on Mondays before, immediately after and one week after a DST transition were used to observe the consequences of small changes in the amount of sleep on humans. The spring shift caused an 8 percent increase and the autumn shift a 6 percent decrease in accidents [^coren-dst]. Interesting is the slight increase in accidents on Mondays following a DST transition, regardless of losing or gaining one hour of sleep opportunity.

{{<flex>}}
 {{<figure src="sleep/dst-traffic-accidents.png" caption="Number of traffic accidents on the mondays before and after a DST transition" class="w-full sm:w-2/3">}}
{{</flex>}}

<!-- Todo: not sure if should be included -->
### Sleep Fragmentation
A study [^lim-sleep-fragmentation] published in 2013 took a group of 737 older adults without dementia and quantified their sleep fragmentation over a ten day period. The devices used to determine the severity of sleep fragmentation were actigraphs, small wristwatch-like accelerometers.

Participants underwent structured annual evaluations which included nineteen neuropsychological tests to identify the development of Alzheimer's disease and to assess the rate of their cognitive decline. Over a six year period individuals with a high fragmentation of sleep (90th percentile) showed a 1.5 fold increase in risk of developing AD and a more rapid rate of cognitive decline.

{{<flex>}}
  {{<figure src="sleep/sleep-fragmentation-ad-probability.jpg" caption="Expected risk of developing AD for high (solid line, 90th percentile) and low (dotted line, 10th percentile) levels of sleep fragmentation">}}
  {{<figure src="sleep/sleep-fragmentation-cognitive-decline.jpg" caption="Expected cognitive decline for high (solid line, 90th percentile) and low (dotted line, 10th percentile) levels of sleep fragmentation">}}
{{</flex>}}

The authors end their work with the following conclusion.

> This work demonstrates an association between sleep fragmentation, cognitive decline, and the risk of subsequent AD. This raises the possibility that interventions to decrease sleep fragmentation may offer a potentially useful strategy for reducing the risk of AD and slowing cognitive decline in older individuals.

### References
[^manfredini-dst]: [R. Manfredini, F. Fabbian, A. De Giorgi, B. Zucchi, R. Cappadona, F. Signani, N. Katsiki, D.P. Mikhailidis. Daylight saving time and myocardial infarction: should we be worried? A review of the evidence](https://www.europeanreview.org/article/14306)
[^kirchberger-dst]: [Kirchberger, I., Wolf, K., Heier, M. et al. Are daylight saving time transitions associated with changes in myocardial infarction incidence? Results from the German MONICA/KORA Myocardial Infarction Registry. BMC Public Health 15, 778 (2015)](https://bmcpublichealth.biomedcentral.com/articles/10.1186/s12889-015-2124-4)
[^lim-sleep-fragmentation]: [Lim ASP; Kowgier M; Yu L; Buchman AS; Bennett DA. Sleep fragmentation and the risk of incident alzheimer's disease and cognitive decline in older persons. SLEEP 2013;36(7):1027-1032](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3669060/)
[^coren-dst]: [Coren, S. Daylight savings time and traffic accidents. New England Journal of Medicine](http://www.medicine.mcgill.ca/epidemiology/hanley/communicationCommunicationCommunication/nejm199604043341416.pdf)
[^medina-dst]: [Diana Medina, Matthew Ebben, PhD, Sara Milrad, BA, Brianna Atkinson, BA, Ana C. Krieger, MD, MPH. Adverse Effects of Daylight Saving Time on Adolescents' Sleep and Vigilance](https://jcsm.aasm.org/doi/10.5664/jcsm.4938#d3e609)
[^barnes-dst]: [C. Barnes, D. Wagner. Changing to Daylight Saving Time Cuts Into Sleep and Increases Workplace Injuries](https://www.apa.org/pubs/journals/releases/apl9451317.pdf)
[^morris-cm]: [Christopher J. Morris, Taylor E. Purvis, Kun Hu, Frank A. J. L. Scheer. Misalignment and cardiovascular disease risk](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4677771/)

<!--
# P11
- sleeping less than six or seven hours a night demolishes your immune system, doubles risk of cancer
- too little sleep swells concentrations of a hormone that makes you feel hungry

# P35
- spider web experiment

# P67
- humans cannot sleep back which they had previously lost

# P73
- abandoning regular siestas in Greece caused a 37 percent increased risk of death from heart disease across a six-year period, relative to whose who maintained regular daytime naps
- especially string on workingmen, where mortality risk increased by well over 60 percent
- men in still napping areas are four times more likely to reach the age of ninety as American males

# P83
- depriving infant rats of REM sleep causes
  - retarded gestational progress
  - stalled construction of the cerebral cortex
  - socially withdrawn and isolated adolescents and adults
- depriving infant rats of sleep causes
  - aberrant patterns of neural connectivity (synaptogenesis)

# P85
- infants of heavy drinking mothers showed a 200 percent reduction of vibrant electrical  activity

# P96
- study on thousands of older adults (controlling for other factors) shows that the lower an individuals sleep efficiency score the
  - higher their mortality risk
  - worse their physical health
  - more likely to supper from depression
  - less energy they report
  - the lower their cognitive function is
- every age effects if sleep is chronically disrupted
  - physical ailments
  - mental health instability
  - reduced alertness
  - impaired memory

# P123
- obtain anything less than eight of sleep a night, especially six
  - time to physical exhaustion drops by 10 to 30 percent
  - aerobic output is significantly reduced
  - similar impairments in limb extension force, vertical jump height
  - decreased peak and sustained muscle strength

# P124
- change of injury graphic

# P131
- 4 hours of sleep per night
  - 6 days: like going 24 hours no sleep, 400 percent increase in microsleeps
  - 11 days: like going 48 hours no sleep
- 6 hours of sleep per night
  - 10 days: like going 24 hours no sleep
- no signs of leveling out
  - performance would likely degrade over weeks and months

# P132
- in relation to previous page
- even after three nights of eights hours of sleep, individuals didn't return to baseline
- australian study
  - doing 19 hours without sleep caused the same cognitive impairment like being legally drunk (0.08% blood alcohol)

# P133
- increased car crash risk graphic

# P134
- after ten days of just seven hours of sleep, the brain is as dysfunctional as it would be after going without sleep for twenty-four hours

# P139
- the amygdala (strong emotion and fight-or-flight response) shows a well over 60 percent amplification in emotional reactivity in sleep deprived participants

# P140
- previous point might be caused by amygdala and prefrontal cortex decoupling
- those results have been achieved by a Japanese by restricting to five hours for five nights

# P141
- studies in adolescents have identified a link between sleep disruption and suicidal thoughts, suicide attempts and completion
- insufficient sleep has been linked to aggression, bullying and behavioral problems in children
- sleep disturbance is a recognized hallmark associated with addictive substance abuse
- insufficient sleep determines relapse rates in numerous addiction disorders because of lacking control of the prefrontal cortex

# P147
- Stickgold study

# P148
- lack of sleep is becoming recognized as a key lifestyle choice in the development of Alzheimer

# P151
- Nedergaard mouse study

# P152
- successfully treating ones sleep disorder delayed the onset of Alzheimer by five to ten years

# P155
- twenty large-scale epidemiological studies with millions of people over decades
  - the shorter you sleep the shorter your life
  - heart disease, obesity, dementia, diabetes and cancer have recognized links to a lack of sleep
- progressively shorter sleep was associated with 45 percent increased risk of developing and/or dying from coronary heart disease within seven or twenty-five years
- similar study with 4000 Japanese male works, fourteen-year period
  - 400 - 500 percent more likely to suffer one or more cardiac arrests when sleep six hours or less compare to normal

# P156
- adults above 45 years, sleep 6 hours or less are 200 percent more likely to have a heart attack or a stroke during their lifetime
- little sleep loss can increase blood pressure resulting in cardiac failure, ischemic heart disease, strokes or kidney failure
- one night of modest sleep reduction, even 1 - 2 hours, will significantly increase the systolic blood pressure in young, fit individuals

# P157
- individuals obtaining just <5/6 hours each night were 200-300% mre likely to suffer calcification of coronary arteries
- increased activity of the sympathetic nervous system
  - body remains in some degree of fight-or-flight
  - can last for years if untreated

# P158
- sympathetic nervous system
  - heart beats faster
  - volumetric rate of blood pumped through vasculature increases -> blood pressure
  - increase in stress hormone cortisol
- growth hormone, header of the body, is shut off by the state of sleep deprivation

# P159
- switching to daylight saving time causes a spike in heart attacks the following day

# P160
- far higher rates of type 2 diabetes in people reporting sleep <6 hours
- sleep 4 hours a night for 6 nights
  - 40 percent less effective in absorbing a standard dose of glucose (likely identified as pre diabetic)

# P161
- 4-5 hours of sleep for 1 week
  - far less receptive to insulin
- chronic sleep deprivation is recognized a one of the major contributors to the escalation of type 2 diabetes

# P162
- Cauter studies
  - strong rise of hunger pangs and increased reported appetite by the second day of short sleep
  - decreased concentration in leptin
  - increasing concentrations in ghrelin

# P163
- Cauter experiment

# P164
- sleep loss increases levels of endocannabinoids
  - stimulates appetite
  - increases desire to snack
  - overeating
- cravings for sweets, carbohydrate-rich foods and salty snacks increased by 30-40% when sleep was reduced by several hours each night

# P165
- prefrontal cortex activity is reduced by a lack of sleep
- sleep deprived people ate 600 extra calories when sleep deprived

# P166
- epidemic of sleep is like to be a key contributor to the epidemic of obesity
- obesity sleep graphic

# P167
- 3-years-olds sleeping just 10.5h or less have a 45% increase of being obese by age 7 than those who get 12
- 5.5h of sleep opportunity cause 70% of weight loss to be lean body mass (muscle), overwise 50% from fat
- short sleep
  - increases hunger
  - compromises impulse control
  - decreases feeling of food satisfaction
  - prevents effective weight loss when dieting
- limit people to 5h of sleep for one week
  - drops in testosterone levels
  - age by 10-15 years in terms of testosterone virility

# P168
- men sleep to little or bad quality have a 29% lower sperm count, sperms are deformed, small testicles

# P169
- people after one night of short sleep look more fatigued, less healthy and less attractive

# P170
- measure sleep of 150 people for one week
  - quarantined, infected with rhinovirus
  - the less sleep, the more like to be infected
  - ~5h -> 50% infection rate
  - >7h -> 13% infection rate
- discovery in 2002
  - flu shot study

# P172
- single night of 4h sleep removed 70% of the natural killer cells in the immune system
- negative results on night time shift recognized in countries like Denmark

# P173
- large study of almost 25k people, those sleeping <6h
  - 40% increased risk of developing cancer
  - similar in 75k woman study

# P174
- Gozal studies
- sleep deprived mice experience a 200% increase in speed and size of cancer growth
- tumors are more aggressive in sleep deprived mice
- sleep loss diminishes one form of tumor associated macrophages (immune cells) that combat cancer
- WHO nighttime shift work as probably carcinogenic

# P175/176
- gene stuff

# P202
- removing REM sleep removed ability to read the social world

# P228
- sympathetic nervous system
  - increased heart rate, blood flow, metabolic rate, release of stress negotiating chemicals such as cortisol

# P243
- based on epidemiological data, adults sleep 6.75h average would be predicted to live inly into their early sixties

# P244
- relationship between sleep and mortality risk is not linear

# P252/253
- alcohol fragments sleep, litters night with brief awakenings -> not continuous and not restorative
- alcoholics show little in the way of identifiable REM sleep
  - long stretches cause a high pressure of REM sleep
  - spills into wakefulness -> hallucinations and delusions ("delirium tremens")

# P254
- alcohol study

# P259
- no other species demonstrates unnatural act of prematurely terminating sleep
- alarm clocks cause spike in blood pressure, shock acceleration in heart rate cause by explosive burst of activity by the sympathetic nervous system
- snooze inflicts this state multiple times
-->
