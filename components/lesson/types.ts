// components/lesson/types.ts
export type SubjectOption = { value: string; label: string; subjectId?: string };

export type AttendanceRow = {
  isHeader: boolean;
  idUczen: string;
  imieNazwisko: string;
  status: "Obecny" | "Nieobecny" | "Spóźniony" | "Usprawiedliwiony" | "Zwolniony";
  uwagi?: string;
  ocenySem1Html: string;
  ocenySem2Html: string;
  sredniaRoczna: number | null;
};

export type StudentRow = {
  _id: string;
  imie: string;
  nazwisko: string;
};
