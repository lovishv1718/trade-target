import type { ComponentType } from "react";
import { CagrCalculator, LumpsumCalculator, SipCalculator, StepUpSipCalculator, SwpCalculator } from "./investing-calcs";
import { CarLoanCalculator, HomeLoanCalculator, PersonalLoanCalculator } from "./loan-calcs";
import { EpfCalculator, NpsCalculator, RetirementCalculator } from "./retirement-calcs";
import { FdCalculator, PpfCalculator, RdCalculator } from "./savings-calcs";
import { HraCalculator, IncomeTaxCalculator } from "./tax-calcs";

export const CALCULATORS: Record<string, ComponentType> = {
  "sip-calculator": SipCalculator,
  "lumpsum-calculator": LumpsumCalculator,
  "step-up-sip-calculator": StepUpSipCalculator,
  "swp-calculator": SwpCalculator,
  "ppf-calculator": PpfCalculator,
  "epf-calculator": EpfCalculator,
  "fd-calculator": FdCalculator,
  "rd-calculator": RdCalculator,
  "nps-calculator": NpsCalculator,
  "retirement-calculator": RetirementCalculator,
  "home-loan-emi-calculator": HomeLoanCalculator,
  "car-loan-emi-calculator": CarLoanCalculator,
  "personal-loan-emi-calculator": PersonalLoanCalculator,
  "income-tax-calculator": IncomeTaxCalculator,
  "hra-calculator": HraCalculator,
  "cagr-calculator": CagrCalculator,
};
