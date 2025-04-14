document.addEventListener('DOMContentLoaded', function() {
    // Initialize job filters
    const jobSearch = document.getElementById('job-search');
    const statusFilter = document.getElementById('status-filter');
    const sortFilter = document.getElementById('sort-filter');
    const jobsList = document.querySelector('.jobs-list');
    const jobItems = document.querySelectorAll('.job-item');

    // Function to filter and sort jobs
    function filterAndSortJobs() {
        const searchTerm = jobSearch.value.toLowerCase();
        const statusValue = statusFilter.value;
        const sortValue = sortFilter.value;

        // Convert job items to array for sorting
        const jobsArray = Array.from(jobItems);

        // Filter jobs
        const filteredJobs = jobsArray.filter(job => {
            const jobTitle = job.querySelector('h3').textContent.toLowerCase();
            const jobStatus = job.querySelector('.job-status').classList[1];
            const matchesSearch = jobTitle.includes(searchTerm);
            const matchesStatus = statusValue === 'all' || jobStatus === statusValue;
            return matchesSearch && matchesStatus;
        });

        // Sort jobs
        filteredJobs.sort((a, b) => {
            const dateA = new Date(a.querySelector('.fa-calendar-alt').parentElement.textContent.split(': ')[1]);
            const dateB = new Date(b.querySelector('.fa-calendar-alt').parentElement.textContent.split(': ')[1]);
            const applicationsA = parseInt(a.querySelector('.fa-users').parentElement.textContent);
            const applicationsB = parseInt(b.querySelector('.fa-users').parentElement.textContent);

            switch(sortValue) {
                case 'newest':
                    return dateB - dateA;
                case 'oldest':
                    return dateA - dateB;
                case 'applications':
                    return applicationsB - applicationsA;
                default:
                    return 0;
            }
        });

        // Clear and re-append sorted jobs
        jobsList.innerHTML = '';
        filteredJobs.forEach(job => jobsList.appendChild(job));
    }

    // Add event listeners for filters
    jobSearch.addEventListener('input', filterAndSortJobs);
    statusFilter.addEventListener('change', filterAndSortJobs);
    sortFilter.addEventListener('change', filterAndSortJobs);

    // Handle job actions
    document.querySelectorAll('.job-item').forEach(job => {
        // View Applications
        job.querySelector('.view-applications').addEventListener('click', function() {
            const jobTitle = job.querySelector('h3').textContent;
            // Redirect to applications page with job ID
            window.location.href = `applications.html?job=${encodeURIComponent(jobTitle)}`;
        });

        // Edit Job
        job.querySelector('.edit-job').addEventListener('click', function() {
            const jobTitle = job.querySelector('h3').textContent;
            // Redirect to edit job page with job ID
            window.location.href = `edit-job.html?job=${encodeURIComponent(jobTitle)}`;
        });

        // Delete Job
        job.querySelector('.delete-job').addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
                const jobTitle = job.querySelector('h3').textContent;
                // Here you would typically make an API call to delete the job
                console.log(`Deleting job: ${jobTitle}`);
                job.remove();
                updateJobStats();
            }
        });
    });

    // Function to update job statistics
    function updateJobStats() {
        const totalJobs = document.querySelectorAll('.job-item').length;
        const activeJobs = document.querySelectorAll('.job-status.active').length;
        const pendingJobs = document.querySelectorAll('.job-status.pending').length;
        const expiredJobs = document.querySelectorAll('.job-status.expired').length;

        // Update statistics in the stats card
        document.querySelector('.stats-card .stat-item:nth-child(1) .stat-number').textContent = totalJobs;
        document.querySelector('.stats-card .stat-item:nth-child(2) .stat-number').textContent = activeJobs;
        document.querySelector('.stats-card .stat-item:nth-child(3) .stat-number').textContent = pendingJobs;
        document.querySelector('.stats-card .stat-item:nth-child(4) .stat-number').textContent = expiredJobs;

        // Calculate total applications
        const totalApplications = Array.from(document.querySelectorAll('.fa-users')).reduce((sum, el) => {
            return sum + parseInt(el.parentElement.textContent);
        }, 0);

        // Update application statistics
        document.querySelector('.stats-card:last-child .stat-item:first-child .stat-number').textContent = totalApplications;
    }

    // Initialize job statistics
    updateJobStats();
}); 