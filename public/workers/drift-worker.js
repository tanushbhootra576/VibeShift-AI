// Deadline Drift Velocity (DDV) Web Worker
// Calculates velocity risk entirely off the main thread.

self.onmessage = function(e) {
  const { tasks } = e.data;
  
  if (!tasks || tasks.length === 0) return;

  let totalEstimated = 0;
  let totalCompleted = 0;
  let totalHoursRemaining = 0;

  tasks.forEach((task) => {
    // Basic heuristics for this phase implementation
    const est = parseInt(task.timeEstimate) || 0;
    const completed = task.completed ? est : (est * 0.3); // mock 30% if not done
    
    let hoursRemaining = 24; // Default
    if (task.deadline === 'Today 5PM') hoursRemaining = 5;
    else if (task.deadline === 'Tonight') hoursRemaining = 8;
    else if (task.deadline === 'Tomorrow') hoursRemaining = 24;

    totalEstimated += est;
    totalCompleted += completed;
    totalHoursRemaining += hoursRemaining;
  });

  const avgHours = totalHoursRemaining / tasks.length;
  
  // DDV Formula
  let ddv = 0;
  if (avgHours > 0) {
    ddv = (totalEstimated - totalCompleted) / avgHours;
  }

  let classification = "Stable";
  if (ddv > 0.50) classification = "Critical";
  else if (ddv > 0.35) classification = "High Risk";
  else if (ddv > 0.20) classification = "Warning";

  self.postMessage({
    driftVelocity: ddv,
    classification
  });
};
