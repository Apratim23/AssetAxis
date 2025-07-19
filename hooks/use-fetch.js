// hooks/use-fetch.js
'use client';

import { toast } from "sonner";
import { useState} from "react";

const useFetch =(cb)=>{
    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(false); // Default to false for initial state
    const [error, setError] = useState(null);

    // Use useCallback to memoize the 'fn' function and ensure it accepts arguments
    const fn = async (...args) => {
  setLoading(true);
  setError(null);

  try {
    const response = await cb(...args);
    setData(response);            // ✅ Save it in state
    return response;              // ✅ Return it!
  } catch (error) {
    setError(error);
    toast.error(error.message || "Something went wrong");
    return null;                  // ✅ Explicitly return null if it fails
  } finally {
    setLoading(false);
  }
};
    return {data,loading,error,fn,setData};
};

export default useFetch;