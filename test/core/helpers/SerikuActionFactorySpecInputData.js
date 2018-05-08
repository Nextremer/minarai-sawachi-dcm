const none = undefined;
/* ["topic", "target",                   "gender", "event", "period"]; */
export const TEST_CASES = [
  {
    contextText: "topic以外のすべての項目を利用しない場合"
,    itText: "topicが一致するconditionのactionIdを返す"
,    consensus: ["toilet",          none,      none,     none,   none]
,    contextBody: ["toilet",        none,      none,     none,   none]
,    expected: "toilet"
  },
  {
    contextText: "targetを要求する条件を持つtopicに対してtargetが設定されていない場合"
,    itText: "targetを要求しないコンディションにマッチするactionIdを返す"
,    consensus: ["profile",         none,      "male",   "100m", "current"]
,    contextBody: ["profile",       none,      "male",   "100m", "current"]
,    expected: "unknown_profile"
  },
  {
    contextText: "topicが存在しない場合,かつPeriodが指定されている"
,    itText: "topicが-である条件のうち、periodが指定されているもののactionIdを返す"
,    consensus: [none,              none,      none,     none,   "current"]
,    contextBody: [none,            none,      none,     none,   "current"]
,    expected: "about_period"
  },
  {
    contextText: "topic及びcontxt.body.targetが定義されている"
,    itText: "topicで抽出下条件のうち、target.typeが一致するconditionのactionIdを返す"
,    consensus: ["profile",         none,      none,     none,   none]
,    contextBody: ["profile",       "serina",  none,     none,   none]
,    expected: "serina_profile"
  },
  {
    contextText: "同一topicのうち複数の条件にマッチする場合"
,    itText: "最初にされた条件が優先されること"
,    consensus: ["profile",         "player",  none,     none,   none]
,    contextBody: ["profile",       "player",  none,     none,   none]
,    expected: "player_profile",
  },
  {
    contextText: "直近の発話がtopic=無し,target=指定ありで、かつcontext上のtopicがtargetを必要としていない場合"
,    itText: "contextに入っているtopicを考慮せず、topic=undefinedとして条件に一致するactionIdを返す"
,    consensus: [none,              "country", none,     none,   none]
,    contextBody: ["toilet",        "country", none,     none,   none]
,    expected: "about_country"
  },
  {
    contextText: "直近の発話がtopic=無し,gender=指定ありで、かつcontext上のtopicがgenderを必要としていない場合"
,    itText: "contextに入っているtopicを考慮せず、topic=undefinedとして条件に一致するactionIdを返す"
,    consensus: [none,              none,      "female", none,   none]
,    contextBody: ["profile",       none,      "female", none,   none]
,    expected: "about_gender"
  },
  {
    contextText: "aaaa"
,    itText: "hoge"
,    consensus: [none,              "country", none,     "100m", none]
,    contextBody: ["profile",       "country", none,     "100m", none]
,    expected: "country_profile"
  },
  {
    contextText: "直近の発話がtopic=無し,event=指定ありで、かつcontext上のtopicがeventを必要としていない場合"
,    itText: "contextに入っているtopicを考慮せず、topic=undefinedとして条件に一致するactionIdを返す"
,    consensus: [none,              none,      none,     "100m", none]
,    contextBody: ["profile",       none,      none,     "100m", none]
,    expected: "about_event"
  },
  {
    contextText: "直近の発話がtopic=無し,period=指定ありで、かつcontext上のtopicがperiodを必要としていない場合"
,    itText: "contextに入っているtopicを考慮せず、topic=undefinedとして条件に一致するactionIdを返す"
,    consensus: [none,              none,      none,     none,   "current"]
,    contextBody: ["profile",       none,      none,     none,   "current"]
,    expected: "about_period"
  },
  {
    contextText: "event,gender,periodの値が[]で囲まれていて、入力のevent,gender,periodには値がセットされていない)"
,    itText: "[]で囲まれたevent,gender,periodは'-'として扱う(DEFAULT VALUE)"
,    consensus: ["default_value",   none,      none,     none,   none]
,    contextBody: ["default_value", none,      none,     none,   none]
,    expected: "default_value_all"
  },
  {
    contextText: "event/gender/periodに値が指定されている場合"
,    itText: "入力のevent,gender,periodとそれぞれが一致するものを適合とする"
,    consensus: [none,   none,      none,     none,   none]
,    contextBody: [none , none,      "men",     "ten",   "right-now"]
,    expected: "strict_condition"
  },
  {
    contextText: "同一トピック内部の複数条件に該当する場合"
,    itText: "直近のinputに最も近いconditionが抽出される"
,    consensus: [none,              none,      none,     "100m", none]
,    contextBody: [none,       "player",      none,     "100m", none]
,    expected: "about_event"
  },
  
];
