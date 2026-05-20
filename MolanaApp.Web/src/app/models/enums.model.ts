export enum IslamicDesignation {
  Molana = 1,
  Mufti = 2,
  Muajjin = 3,
  Imam = 4,
  Qari = 5,
  Hafiz = 6,
  Khateeb = 7,
  Aalim = 8,
  Mudarris = 9,
  Maktab_Teacher = 10,
  Naat_Khwan = 11,
  Qasida_Khwan = 12
}

export const DesignationLabels: { [key: number]: string } = {
  [IslamicDesignation.Molana]: 'مولانا (Molana)',
  [IslamicDesignation.Mufti]: 'مفتی (Mufti)',
  [IslamicDesignation.Muajjin]: 'مؤذن (Muajjin)',
  [IslamicDesignation.Imam]: 'امام (Imam)',
  [IslamicDesignation.Qari]: 'قاری (Qari)',
  [IslamicDesignation.Hafiz]: 'حافظ (Hafiz)',
  [IslamicDesignation.Khateeb]: 'خطیب (Khateeb)',
  [IslamicDesignation.Aalim]: 'عالم (Aalim)',
  [IslamicDesignation.Mudarris]: 'مدرس (Mudarris)',
  [IslamicDesignation.Maktab_Teacher]: 'مکتب ٹیچر (Maktab Teacher)',
  [IslamicDesignation.Naat_Khwan]: 'نعت خواں (Naat Khwan)',
  [IslamicDesignation.Qasida_Khwan]: 'قصیدہ خواں (Qasida Khwan)'
};

export enum JobType {
  FullTime = 1,
  PartTime = 2,
  Contract = 3,
  Temporary = 4,
  Volunteer = 5
}

export const JobTypeLabels: { [key: number]: string } = {
  [JobType.FullTime]: 'Full Time',
  [JobType.PartTime]: 'Part Time',
  [JobType.Contract]: 'Contract',
  [JobType.Temporary]: 'Temporary',
  [JobType.Volunteer]: 'Volunteer'
};

export enum JobStatus {
  Draft = 1,
  Active = 2,
  Closed = 3,
  Expired = 4
}

export enum ApplicationStatus {
  Pending = 1,
  Reviewed = 2,
  Shortlisted = 3,
  Interviewed = 4,
  Accepted = 5,
  Rejected = 6,
  Withdrawn = 7
}

export const ApplicationStatusLabels: { [key: number]: string } = {
  [ApplicationStatus.Pending]: 'زیر التوا (Pending)',
  [ApplicationStatus.Reviewed]: 'جائزہ لیا گیا (Reviewed)',
  [ApplicationStatus.Shortlisted]: 'شارٹ لسٹ (Shortlisted)',
  [ApplicationStatus.Interviewed]: 'انٹرویو (Interviewed)',
  [ApplicationStatus.Accepted]: 'منظور (Accepted)',
  [ApplicationStatus.Rejected]: 'مسترد (Rejected)',
  [ApplicationStatus.Withdrawn]: 'واپس لیا گیا (Withdrawn)'
};
