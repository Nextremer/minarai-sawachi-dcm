



["topic",                 "target",  "gender",         "event",          "period",         "actionId"];
export const MAP_DATA = [
  // SAMPLES
  ["profile",             "player",  "-",              "-",              "-",              "player_profile"],
  ["profile",             "player",  "-",              "-",              "-",              "絶対にこないはず なぜなら一つ上と条件が同じだから"],
  ["profile",             "country", "-",              "-",              "-",              "country_profile"],
  ["profile",             "serina",  "-",              "-",              "-",              "serina_profile"],
  ["profile",             "-",       "-",              "-",              "-",              "unknown_profile"],

  // DEFAULT
  ["default_value",       "-",       "[female]",       "[all]",          "[current]",      "default_value_all"],

  // DEFAULT_CASE2
  ["default_value_case2", "player",  "*",              "*",              "[do_not_write]", "default_case2_1"],
  ["default_value_case2", "player",  "*",              "[do_not_write]", "*",              "default_case2_2"],
  ["default_value_case2", "player",  "[do_not_write]", "*",              "*",              "default_case2_3"],
  ["default_value_case2", "country", "[female]",       "[200m]",         "current",        "default_case2_4"],
  ["default_value_case2", "player",  "*",              "*",              "*",              "default_case2_5"],
  ["default_value_case2", "player",  "[male]",         "[110m]",         "[last]",         "default_case2_6"],

  // FORGET
  ["toilet",              "-",       "-",              "-",              "-",              "toilet"],

  // WITHOUT TOPICS
  ["-",                   "player",  "-",              "-",              "-",              "about_player"],
  ["-",                   "country", "-",              "-",              "-",              "about_country"],
  ["-",                   "serina",  "-",              "-",              "-",              "about_serina"],
  ["-",                   "-",       "men",            "ten,seven",      "right-now",      "strict_condition"],
  ["-",                   "-",       "*",              "-",              "-",              "about_gender"],
  ["-",                   "-",       "-",              "*",              "-",              "about_event"],
  ["-",                   "-",       "-",              "-",              "*",              "about_period"],

  // holdd slots operator
  ["holdSlots",             "player",  "=",              "-",              "-",              "player_profile_hold_slots"],
  ["holdSlots",             "country", "=",              "-",              "-",              "country_profile_hold_slots"],

  ["holdSlots_other",             "serina",  "=",              "-",              "-",              "serina_profile2"],
  ["holdSlots_other",             "-",       "-",              "-",              "-",              "unknown_profile2"],
];
