  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  
  const renderVideo = async (id: string) => {
    try {
      showToast('Rendering gestartet (Maya & HyperFrames)...', 'info');
      setActiveStep(7);
      await fetch(`http://localhost:4000/api/studio/pipeline/render/${id}`, { method: 'POST' });
    } catch (e) {
      showToast('Fehler beim Rendern.', 'error');
    }
  };
