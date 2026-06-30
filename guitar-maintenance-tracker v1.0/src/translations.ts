export interface TranslationDict {
  guitars: string;
  overview: string;
  reminders: string;
  settings: string;
  activeCount: string;
  searchPlaceholder: string;
  showingActiveCollection: string;
  sortedMostOverdue: string;
  emptyCollection: string;
  emptySubtextStatus: string;
  emptySubtextDefault: string;
  catalogFirstGuitar: string;
  stringsLabel: string;
  setupLabel: string;
  never: string;
  quickChangeStrings: string;
  quickCompleteSetup: string;
  viewFullDetails: string;
  logCustomService: string;
  editSpecifications: string;
  archiveGuitar: string;
  unarchiveGuitar: string;
  toastAdded: string;
  toastUpdated: string;
  toastDeleted: string;
  toastStringLogged: string;
  toastSetupLogged: string;
  toastArchived: string;
  toastUnarchived: string;
  toastCustomLogged: string;
  maintenanceOverview: string;
  advancedFilters: string;
  resetFilters: string;
  instrumentType: string;
  allTypes: string;
  electric: string;
  acoustic: string;
  bass: string;
  other: string;
  stringsCount: string;
  allStringsCount: string;
  usageLevel: string;
  allUsage: string;
  light: string;
  regular: string;
  heavy: string;
  collectionStatus: string;
  allStates: string;
  activeCollectionState: string;
  archivedGuitarsState: string;
  soldGuitarsState: string;
  inStorageState: string;
  sortBy: string;
  sortMostOverdue: string;
  sortRecentlyServiced: string;
  sortBrandAtoZ: string;
  sortBrandZtoA: string;
  sortValueHighToLow: string;
  sortAgeOldestFirst: string;
  noGuitarsMatch: string;
  adjustFilters: string;
  appSettings: string;
  formatPreferences: string;
  currencyCode: string;
  dateDisplayFormat: string;
  pushReminderAlerts: string;
  enableAlertsSub: string;
  serviceThresholdLimits: string;
  customizeThresholdsSub: string;
  globalSetting: string;
  overrideFor: string;
  configureNewOverride: string;
  applyThresholdOverride: string;
  maintenanceCategories: string;
  maintenanceCategoriesSub: string;
  addCategory: string;
  dataStorageBackups: string;
  exportEventsCsv: string;
  forSpreadsheet: string;
  fullJsonBackup: string;
  saveCompleteDatabase: string;
  restoreDatabaseBackup: string;
  chooseJsonBackupFile: string;
  dangerZone: string;
  resetDatabaseDemo: string;
  aboutTitle: string;
  aboutText: string;
  languageLabel: string;
  english: string;
  korean: string;
  toastSaved: string;
  toastReset: string;
  toastRestored: string;
  overdue: string;
  dueSoon: string;
  allGood: string;
  pendingReminders: string;
  allGuitarsServiced: string;
  allGuitarsServicedSub: string;
  overdueAttention: string;
  dueSoonAlerts: string;
  needsA: string;
  recommendedSoon: string;
  lastChange: string;
  oneTapLog: string;
  logDetails: string;
  ago: string;
  logStringChange: string;
  logSetupService: string;
  guitarSpecifications: string;
  seeAll: string;
  collapse: string;
  brand: string;
  model: string;
  tuning: string;
  scaleLength: string;
  purchaseYear: string;
  estimatedValue: string;
  specsAndNotes: string;
  noCustomNotes: string;
  maintenanceHistoryTimeline: string;
  allLogs: string;
  noLogsFound: string;
  editGuitar: string;
  timeElapsed: string;
  lastServiced: string;
  editSpecsHeader: string;
  catalogGuitarHeader: string;
  basicDetails: string;
  instrumentNickname: string;
  tuningLabel: string;
  tuningSubtext: string;
  scaleLengthSub: string;
  purchaseYearSub: string;
  estimatedValueSub: string;
  additionalNotes: string;
  additionalNotesPlaceholder: string;
  collectionStatusLabel: string;
  usageIntensity: string;
  usageIntensitySub: string;
  instrumentPhoto: string;
  presetImagesBtn: string;
  presetImagesSubtext: string;
  backBtn: string;
  saveInstrument: string;
  deleteInstrument: string;
  confirmDeleteGuitar: string;
  prefillMaintenanceHeader: string;
  prefillMaintenanceSubtext: string;
  lastStringChangeDateLabel: string;
  stringBrandLabel: string;
  stringTypeLabel: string;
  stringGaugeLabel: string;
  lastSetupDateLabel: string;
  setupTasksDetails: string;
  addSetupTask: string;
  tuningStandard: string;
  tuningStandardBass: string;
  tuningDropD: string;
  tuningHalfStepDown: string;
  tuningDadgad: string;
  tuningDropC: string;
  tuningOpenG: string;
  tuningOtherCustom: string;
  feedbackCategoryAdded: string;
  feedbackCategoryRemoved: string;
  feedbackThresholdConfigured: string;
  feedbackThresholdDeleted: string;
  feedbackCsvDownloaded: string;
  feedbackBackupDownloaded: string;
  feedbackRestored: string;
  feedbackReset: string;
  deleteLogConfirm: string;
  restoreBackupConfirm: string;
  resetDatabaseConfirm: string;
  logCustomServiceHeader: string;
  serviceDateLabel: string;
  serviceCostLabel: string;
  performedByLabel: string;
  specificsNotesLabel: string;
  addDetailedLogsTitle: string;
  addDetailedLogsSub: string;
  saveMaintenanceLog: string;
  toastServiceLogged: string;
  resetSettingsBtn: string;
  resetSettingsConfirm: string;
  feedbackSettingsReset: string;
}

export const translations: Record<'en' | 'ko', TranslationDict> = {
  en: {
    guitars: "Instruments",
    overview: "Overview",
    reminders: "Reminders",
    settings: "Settings",
    activeCount: "{count} Active",
    searchPlaceholder: "Search brand, model, tuning...",
    showingActiveCollection: "SHOWING ACTIVE COLLECTION",
    sortedMostOverdue: "Sorted: Most Overdue First",
    emptyCollection: "Your active instrument collection is empty.",
    emptySubtextStatus: "No active instruments match this specific metric health status.",
    emptySubtextDefault: "Get started by adding your first acoustic, electric, or bass instrument!",
    catalogFirstGuitar: "Add First Instrument",
    stringsLabel: "Strings",
    setupLabel: "Setup / Maintenance",
    never: "Never",
    quickChangeStrings: "⚡ Quick Change Strings",
    quickCompleteSetup: "🛠️ Quick Complete Setup / Maintenance",
    viewFullDetails: "View Full Details",
    logCustomService: "Log Custom Service",
    editSpecifications: "Edit Specifications",
    archiveGuitar: "Archive Instrument",
    unarchiveGuitar: "Unarchive Instrument",
    toastAdded: "Instrument added successfully!",
    toastUpdated: "Specifications updated!",
    toastDeleted: "Instrument removed from database",
    toastStringLogged: "String change event logged!",
    toastSetupLogged: "Setup / maintenance event logged!",
    toastArchived: "Instrument moved to archives",
    toastUnarchived: "Instrument restored to active",
    toastCustomLogged: "Custom maintenance log saved!",
    maintenanceOverview: "Maintenance Overview",
    advancedFilters: "Advanced Filters",
    resetFilters: "Reset Filters",
    instrumentType: "Instrument Type",
    allTypes: "All types",
    electric: "Electric",
    acoustic: "Acoustic",
    bass: "Bass",
    other: "Other",
    stringsCount: "Strings count",
    allStringsCount: "All strings",
    usageLevel: "Usage level",
    allUsage: "All usage",
    light: "Light",
    regular: "Regular",
    heavy: "Heavy/Gigging",
    collectionStatus: "Collection status",
    allStates: "All states",
    activeCollectionState: "Active collection",
    archivedGuitarsState: "Archived instruments",
    soldGuitarsState: "Sold instruments",
    inStorageState: "In storage",
    sortBy: "Sort by",
    sortMostOverdue: "Most Overdue / Health First",
    sortRecentlyServiced: "Recently Serviced Setup",
    sortBrandAtoZ: "Brand name (A to Z)",
    sortBrandZtoA: "Brand name (Z to A)",
    sortValueHighToLow: "Purchase Value (High to Low)",
    sortAgeOldestFirst: "Purchase Year (Oldest First)",
    noGuitarsMatch: "No instruments match your query.",
    adjustFilters: "Try adjusting your filters or typing different keywords.",
    appSettings: "Application Settings",
    formatPreferences: "Format & Preferences",
    currencyCode: "Currency Code",
    dateDisplayFormat: "Date Display Format",
    pushReminderAlerts: "Push Reminder Alerts",
    enableAlertsSub: "Enable overdue & critical alerts",
    serviceThresholdLimits: "Service Threshold Limits (Days)",
    customizeThresholdsSub: "Customize warning (yellow/overdue) and urgent critical (red/critical) limits in days elapsed.",
    globalSetting: "Global setting",
    overrideFor: "Override for {name}",
    configureNewOverride: "Configure New Override Limit",
    applyThresholdOverride: "Apply Threshold Limit Override",
    maintenanceCategories: "Maintenance Categories",
    maintenanceCategoriesSub: "Manage custom service categories. Default categories cannot be deleted.",
    addCategory: "Add Category",
    dataStorageBackups: "Data Storage & Backups",
    exportEventsCsv: "Export Events (CSV)",
    forSpreadsheet: "For spreadsheet/Excel",
    fullJsonBackup: "Full JSON Backup",
    saveCompleteDatabase: "Save complete database",
    restoreDatabaseBackup: "Restore Database from JSON Backup",
    chooseJsonBackupFile: "Choose JSON backup file",
    dangerZone: "Danger Zone",
    resetDatabaseDemo: "RESET DATABASE TO DEFAULT DEMO",
    aboutTitle: "Guitar Maintenance Tracker v1.0",
    aboutText: "Designed and built for myself mainly, but if you did somehow managed to get this app, hope you enjoy using it!\n\nFind me on Youtube: https://www.youtube.com/@Mojojojoe",
    languageLabel: "Language",
    english: "English",
    korean: "Korean (한국어)",
    toastSaved: "Settings saved successfully!",
    toastReset: "Database reset to defaults!",
    toastRestored: "Backup restored successfully!",
    overdue: "Critical",
    dueSoon: "Overdue",
    allGood: "Maintained",
    pendingReminders: "{count} Pending",
    allGuitarsServiced: "All Instruments Serviced",
    allGuitarsServicedSub: "Fantastic work! Every instrument in your active collection is currently fresh and fully setup according to your thresholds.",
    overdueAttention: "Critical Attention Required",
    dueSoonAlerts: "Overdue Alerts",
    needsA: "Needs a",
    recommendedSoon: "Recommended soon",
    lastChange: "Last change:",
    oneTapLog: "1-Tap Log",
    logDetails: "Log Details",
    ago: "ago",
    logStringChange: "Log String Change",
    logSetupService: "Log Setup / Maintenance",
    guitarSpecifications: "Instrument Specifications",
    seeAll: "See all",
    collapse: "Collapse",
    brand: "Brand",
    model: "Model",
    tuning: "Tuning",
    scaleLength: "Scale Length",
    purchaseYear: "Purchase Year",
    estimatedValue: "Purchase Value",
    specsAndNotes: "Specifications & Notes",
    noCustomNotes: "No custom notes provided.",
    maintenanceHistoryTimeline: "Maintenance History Timeline",
    allLogs: "All Logs",
    noLogsFound: "No maintenance logs found matching this filter.",
    editGuitar: "EDIT INSTRUMENT",
    timeElapsed: "Time Elapsed",
    lastServiced: "Last Serviced",
    editSpecsHeader: "Edit Instrument",
    catalogGuitarHeader: "Add Instrument",
    basicDetails: "Basic Details",
    instrumentNickname: "Instrument Nickname (e.g., 'Sunny')",
    tuningLabel: "Tuning",
    tuningSubtext: "Standard pitch or custom open tuning",
    scaleLengthSub: "Scale Length (e.g. 25.5\", 24.75\")",
    purchaseYearSub: "Purchase Year (e.g. 2021)",
    estimatedValueSub: "Purchase Value",
    additionalNotes: "Additional Specifications & Notes",
    additionalNotesPlaceholder: "Wood types, pick-up upgrades, modifications, or string preferences...",
    collectionStatusLabel: "Collection Status",
    usageIntensity: "Usage Intensity",
    usageIntensitySub: "Affects overdue warnings & rate of aging",
    instrumentPhoto: "Instrument Thumbnail Photo",
    presetImagesBtn: "Choose / Upload Photo",
    presetImagesSubtext: "Select a photo from your local device",
    backBtn: "Back",
    saveInstrument: "SAVE INSTRUMENT",
    deleteInstrument: "Delete Instrument",
    confirmDeleteGuitar: "Are you sure you want to delete this instrument? All of its maintenance logs will be permanently deleted!",
    prefillMaintenanceHeader: "Initial String Change & Setup / Maintenance Pre-Fill",
    prefillMaintenanceSubtext: "Save time by recording your last known maintenance completed, or leave empty if unknown.",
    lastStringChangeDateLabel: "Last String Change Date",
    stringBrandLabel: "String Brand",
    stringTypeLabel: "String Type (e.g. Coated Nickel)",
    stringGaugeLabel: "String Gauge (e.g. 10-46, 12-53)",
    lastSetupDateLabel: "Last Setup / Maintenance Date",
    setupTasksDetails: "Completed Tasks / Details",
    addSetupTask: "Add Task",
    tuningStandard: "Standard (E A D G B e)",
    tuningStandardBass: "Standard Bass (E A D G)",
    tuningDropD: "Drop D (D A D G B e)",
    tuningHalfStepDown: "Half-Step Down (Eb Ab Db Gb Bb eb)",
    tuningDadgad: "DADGAD (D A D G A d)",
    tuningDropC: "Drop C (C G C F A d)",
    tuningOpenG: "Open G (D G D G B d)",
    tuningOtherCustom: "Other / Custom",
    feedbackCategoryAdded: "Category registered!",
    feedbackCategoryRemoved: "Category removed.",
    feedbackThresholdConfigured: "Threshold configured",
    feedbackThresholdDeleted: "Threshold custom setting deleted.",
    feedbackCsvDownloaded: "CSV report downloaded successfully!",
    feedbackBackupDownloaded: "Full database JSON backup downloaded!",
    feedbackRestored: "Collection and events restored successfully!",
    feedbackReset: "Database reset to defaults!",
    deleteLogConfirm: "Are you sure you want to delete this event log?",
    restoreBackupConfirm: "Are you absolutely sure you want to restore this backup? This will completely replace your existing guitars and logs!",
    resetDatabaseConfirm: "WARNING: Are you absolutely sure you want to reset the database? This will delete all of your custom guitars and events, restoring the standard defaults.",
    resetSettingsBtn: "RESET SETTINGS TO DEFAULTS",
    resetSettingsConfirm: "Are you sure you want to reset all app settings, custom thresholds, and maintenance categories to defaults? This will NOT delete or reset your instruments (guitars) or logged events.",
    feedbackSettingsReset: "Settings reset to defaults successfully!",
    logCustomServiceHeader: "Log Custom Maintenance Service",
    serviceDateLabel: "Service Date",
    serviceCostLabel: "Service / Parts Cost",
    performedByLabel: "Performed By",
    specificsNotesLabel: "Specifics & Service Notes",
    addDetailedLogsTitle: "Add Detailed Logs",
    addDetailedLogsSub: "Add photo logs, custom part invoices, string brands, and service records.",
    saveMaintenanceLog: "SAVE MAINTENANCE LOG",
    toastServiceLogged: "Maintenance service event logged!"
  },
  ko: {
    guitars: "내 악기 목록",
    overview: "정비 오버뷰",
    reminders: "정비 알림",
    settings: "설정",
    activeCount: "{count}대 활성",
    searchPlaceholder: "브랜드, 모델, 튜닝 검색...",
    showingActiveCollection: "활성 악기 컬렉션",
    sortedMostOverdue: "정렬: 오래된 정비 순",
    emptyCollection: "등록된 활성 악기가 없습니다.",
    emptySubtextStatus: "선택한 정비 상태에 해당하는 활성 악기가 없습니다.",
    emptySubtextDefault: "첫 번째 어쿠스틱, 일렉트릭 또는 베이스 악기를 카탈로그에 등록해 보세요!",
    catalogFirstGuitar: "첫 악기 등록하기",
    stringsLabel: "스트링",
    setupLabel: "셋업 / 정비",
    never: "없음",
    quickChangeStrings: "⚡ 빠른 스트링 교체 완료",
    quickCompleteSetup: "🛠️ 빠른 셋업 / 정비 완료",
    viewFullDetails: "상세 정보 보기",
    logCustomService: "커스텀 정비 기록",
    editSpecifications: "사양 정보 수정",
    archiveGuitar: "보관함으로 이동",
    unarchiveGuitar: "보관 취소 (활성화)",
    toastAdded: "새 악기가 등록되었습니다!",
    toastUpdated: "악기 사양이 업데이트되었습니다!",
    toastDeleted: "악기가 데이터베이스에서 삭제되었습니다",
    toastStringLogged: "스트링 교체 이벤트가 기록되었습니다!",
    toastSetupLogged: "셋업 / 정비 이벤트가 기록되었습니다!",
    toastArchived: "악기가 보관함으로 이동되었습니다",
    toastUnarchived: "악기가 다시 활성화되었습니다",
    toastCustomLogged: "커스텀 정비 로그가 저장되었습니다!",
    maintenanceOverview: "악기 정비 오버뷰",
    advancedFilters: "고급 필터 설정",
    resetFilters: "필터 초기화",
    instrumentType: "악기 종류",
    allTypes: "모든 종류",
    electric: "일렉트릭 기타",
    acoustic: "어쿠스틱 기타",
    bass: "베이스 기타",
    other: "기타 악기",
    stringsCount: "스트링(현) 개수",
    allStringsCount: "모든 개수",
    usageLevel: "사용 빈도",
    allUsage: "모든 빈도",
    light: "가끔 연주 (적음)",
    regular: "자주 연주 (보통)",
    heavy: "매일 연주 / 공연용 (많음)",
    collectionStatus: "컬렉션 상태",
    allStates: "모든 상태",
    activeCollectionState: "활성 컬렉션",
    archivedGuitarsState: "보관된 악기",
    soldGuitarsState: "판매 완료",
    inStorageState: "보관 중 (미사용)",
    sortBy: "정렬 방식",
    sortMostOverdue: "오래된 정비 / 관리 필요순",
    sortRecentlyServiced: "최근 정비 완료순",
    sortBrandAtoZ: "브랜드명 (오름차순)",
    sortBrandZtoA: "브랜드명 (내림차순)",
    sortValueHighToLow: "구매 가격 (높은 순)",
    sortAgeOldestFirst: "구매 연도 (오래된 순)",
    noGuitarsMatch: "검색 및 필터 조건에 부합하는 악기가 없습니다.",
    adjustFilters: "필터 기준을 변경하거나 다른 키워드를 입력해 보세요.",
    appSettings: "애플리케이션 설정",
    formatPreferences: "형식 및 사용자 기본 설정",
    currencyCode: "표시 통화 단위",
    dateDisplayFormat: "날짜 표시 형식",
    pushReminderAlerts: "푸시 정비 알림",
    enableAlertsSub: "관리 필요 및 관리 시급 알림 활성화",
    serviceThresholdLimits: "정비 주기 기준 설정 (일 단위)",
    customizeThresholdsSub: "각 정비의 경고(노란색/관리 필요) 및 위급(빨간색/관리 시급) 기준일수를 개별 설정합니다.",
    globalSetting: "전체 적용 기준",
    overrideFor: "{name} 개별 설정",
    configureNewOverride: "개별 정비 주기 설정 추가",
    applyThresholdOverride: "정비 주기 기준 등록",
    maintenanceCategories: "정비 카테고리 관리",
    maintenanceCategoriesSub: "커스텀 정비 카테고리를 관리합니다. 기본 카테고리는 삭제할 수 없습니다.",
    addCategory: "카테고리 추가",
    dataStorageBackups: "데이터 저장 및 백업 도구",
    exportEventsCsv: "정비 기록 내보내기 (CSV)",
    forSpreadsheet: "엑셀 및 스프레드시트 분석용",
    fullJsonBackup: "전체 JSON 백업 다운로드",
    saveCompleteDatabase: "모든 데이터베이스 파일 안전하게 저장",
    restoreDatabaseBackup: "JSON 백업 파일에서 데이터 복구",
    chooseJsonBackupFile: "백업 JSON 파일 선택",
    dangerZone: "위험 구역 (초기화)",
    resetDatabaseDemo: "데이터베이스 데모 상태로 초기화",
    aboutTitle: "기타 정비 트래커 (Guitar Maintenance Tracker) v1.0",
    aboutText: "주로 개인적인 용도로 개발한 앱이지만, 어떻게든 이 앱을 접하게 되셨다면 유용하게 사용하시길 바랍니다!\n\n유튜브 채널: https://www.youtube.com/@Mojojojoe",
    languageLabel: "언어 선택 (Language)",
    english: "영어 (English)",
    korean: "한국어 (Korean)",
    toastSaved: "설정이 성공적으로 저장되었습니다!",
    toastReset: "데이터베이스가 기본 데모 상태로 리셋되었습니다!",
    toastRestored: "백업 데이터가 성공적으로 복구되었습니다!",
    overdue: "관리 시급",
    dueSoon: "관리 필요",
    allGood: "좋음",
    pendingReminders: "{count}건 대기 중",
    allGuitarsServiced: "모든 악기 정비 완료",
    allGuitarsServicedSub: "참 잘하셨습니다! 활성화된 컬렉션 내 모든 악기의 정비 상태가 매우 양호합니다.",
    overdueAttention: "관리 시급 정비 항목",
    dueSoonAlerts: "관리 필요 정비 항목",
    needsA: "정비 필요 항목:",
    recommendedSoon: "조만간 정비 권장",
    lastChange: "마지막 정비일:",
    oneTapLog: "1-탭 완료",
    logDetails: "기록 작성",
    ago: "전",
    logStringChange: "스트링 교체 기록",
    logSetupService: "셋업 및 종합 정비 기록",
    guitarSpecifications: "악기 스펙 사양",
    seeAll: "자세히 보기",
    collapse: "접기",
    brand: "브랜드",
    model: "모델명",
    tuning: "세팅 튜닝",
    scaleLength: "스케일 길이",
    purchaseYear: "구매 연도",
    estimatedValue: "구매 가격",
    specsAndNotes: "상세 스펙 및 메모",
    noCustomNotes: "등록된 사양 정보가 없습니다.",
    maintenanceHistoryTimeline: "악기 정비 히스토리 타임라인",
    allLogs: "전체 기록",
    noLogsFound: "해당 조건의 정비 기록이 없습니다.",
    editGuitar: "악기 정보 수정",
    timeElapsed: "경과 시간",
    lastServiced: "마지막 정비",
    editSpecsHeader: "악기 정보 수정",
    catalogGuitarHeader: "새 악기 등록",
    basicDetails: "기본 세부 정보",
    instrumentNickname: "악기 애칭 (예: '마이 텔레')",
    tuningLabel: "튜닝",
    tuningSubtext: "스탠다드 튜닝 혹은 커스텀 오픈 튜닝",
    scaleLengthSub: "스케일 길이 (예: 25.5\", 24.75\")",
    purchaseYearSub: "구매 연도 (예: 2021)",
    estimatedValueSub: "구매 가격",
    additionalNotes: "추가 상세 스펙 및 세부 메모",
    additionalNotesPlaceholder: "목재 사양, 픽업 종류, 개조 사항, 스트링 게이지 선호 사항 등...",
    collectionStatusLabel: "컬렉션 보유 상태",
    usageIntensity: "연주 및 사용 강도",
    usageIntensitySub: "정비 권장 주기 경고 및 노화 속도에 영향을 줍니다.",
    instrumentPhoto: "악기 썸네일 이미지 사진",
    presetImagesBtn: "사진 선택 / 업로드",
    presetImagesSubtext: "기기에서 이미지 파일을 업로드합니다.",
    backBtn: "이전",
    saveInstrument: "악기 저장하기",
    deleteInstrument: "악기 등록 삭제",
    confirmDeleteGuitar: "정말로 이 악기를 삭제하시겠습니까? 관련 모든 정비 및 서비스 내역이 영구적으로 지워집니다!",
    prefillMaintenanceHeader: "초기 스트링 교체 및 셋업 / 정비 기록 사전입력 (선택 사항)",
    prefillMaintenanceSubtext: "마지막 정비 시점을 입력하면 정비 주기가 자동 역산됩니다. 모르면 비워두셔도 됩니다.",
    lastStringChangeDateLabel: "마지막 스트링(현) 교체일",
    stringBrandLabel: "스트링 브랜드명",
    stringTypeLabel: "스트링 종류 (예: 니켈 코팅현)",
    stringGaugeLabel: "스트링 게이지 (예: 10-46, 12-53)",
    lastSetupDateLabel: "마지막 종합 셋업 / 정비 완료일",
    setupTasksDetails: "완료한 셋업 내용 / 작업 상세",
    addSetupTask: "항목 추가",
    tuningStandard: "스탠다드 (E A D G B e)",
    tuningStandardBass: "스탠다드 베이스 (E A D G)",
    tuningDropD: "드롭 D (D A D G B e)",
    tuningHalfStepDown: "반음 다운 (Eb Ab Db Gb Bb eb)",
    tuningDadgad: "대드개드 (D A D G A d)",
    tuningDropC: "드롭 C (C G C F A d)",
    tuningOpenG: "오픈 G (D G D G B d)",
    tuningOtherCustom: "기타 / 커스텀 튜닝",
    feedbackCategoryAdded: "카테고리가 성공적으로 등록되었습니다!",
    feedbackCategoryRemoved: "카테고리가 삭제되었습니다.",
    feedbackThresholdConfigured: "정비 주기가 설정되었습니다.",
    feedbackThresholdDeleted: "해당 개별 정비 주기 설정이 삭제되었습니다.",
    feedbackCsvDownloaded: "CSV 정비 내역 리포트 다운로드 완료!",
    feedbackBackupDownloaded: "전체 데이터베이스 JSON 백업 다운로드 완료!",
    feedbackRestored: "악기 및 정비 기록 복구 완료!",
    feedbackReset: "데이터베이스가 기본 데모 컬렉션 상태로 초기화되었습니다!",
    deleteLogConfirm: "이 정비 기록 로그를 삭제하시겠습니까?",
    restoreBackupConfirm: "백업 데이터를 복구하시겠습니까? 현재 등록된 모든 악기 및 정비 내역이 완전히 교체됩니다!",
    resetDatabaseConfirm: "경고: 데이터베이스를 초기화하시겠습니까? 직접 등록하신 모든 악기 및 기록이 지워지며 데모 데이터로 채워집니다.",
    resetSettingsBtn: "설정 및 정비 주기 초기화",
    resetSettingsConfirm: "모든 앱 설정, 정비 주기 임계값, 정비 카테고리를 초기 상태로 되돌리시겠습니까? 등록하신 악기(기타) 및 정비 기록 데이터는 삭제되지 않고 그대로 유지됩니다.",
    feedbackSettingsReset: "모든 설정이 성공적으로 초기화되었습니다!",
    logCustomServiceHeader: "종합 커스텀 정비 서비스 기록",
    serviceDateLabel: "서비스/정비 날짜",
    serviceCostLabel: "정비 / 부품 비용",
    performedByLabel: "작업자 / 리페어샵 명칭",
    specificsNotesLabel: "상세 정비 내용 및 서비스 메모",
    addDetailedLogsTitle: "정밀 상세 로그 추가",
    addDetailedLogsSub: "인보이스 비용 영수증, 사용 부품 사양, 정밀 세팅 수치를 함께 저장합니다.",
    saveMaintenanceLog: "정비 서비스 기록 저장",
    toastServiceLogged: "악기 서비스/정비 기록이 안전하게 저장되었습니다!"
  }
};
