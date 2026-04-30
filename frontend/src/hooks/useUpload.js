import { useState } from "react";
import { uploadPDF, analyzeContract } from "../services/api";
import toast from "react-hot-toast";

export const useUpload = () => {
  const [step, setStep] = useState("idle"); // idle | uploading | analyzing | done | error
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [contractText, setContractText] = useState("");
  const [error, setError] = useState(null);

  const process = async (file, { userType = "general", language = "English" } = {}) => {
    setStep("uploading");
    setError(null);
    setProgress(0);

    try {
      // Step 1: Upload & parse PDF
      const uploadData = await uploadPDF(file, setProgress);
      setContractText(uploadData.contractText);

      // Step 2: Analyze
      setStep("analyzing");
      const analysis = await analyzeContract({
        contractText: uploadData.contractText,
        filename: file.name,
        charCount: uploadData.charCount,
        userType,
        language,
      });

      setResult(analysis);
      setStep("done");
      toast.success("Analysis complete!");
      return { analysis, contractText: uploadData.contractText };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Something went wrong.";
      setError(msg);
      setStep("error");
      toast.error(msg);
      return null;
    }
  };

  const reset = () => {
    setStep("idle");
    setProgress(0);
    setResult(null);
    setContractText("");
    setError(null);
  };

  return { step, progress, result, contractText, error, process, reset };
};
