document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    const searchInput = document.querySelector('.search-input input');
    const searchButton = document.querySelector('.search-box button');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    const jobList = document.querySelector('.job-list');
    const resultsCount = document.querySelector('.results-count h2');
    const sortSelect = document.querySelector('.results-sort select');
    const pagination = document.querySelector('.pagination');

    // Current search parameters
    let currentPage = 1;
    let currentFilters = {
        keyword: '',
        location: '',
        jobType: '',
        industry: '',
        salaryRange: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    };

    // Fetch jobs from backend
    async function fetchJobs() {
        try {
            const queryParams = new URLSearchParams({
                ...currentFilters,
                page: currentPage,
                limit: 10
            });

            const response = await fetch(`/api/jobs/search?${queryParams}`);
            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            renderJobs(data.jobs);
            updatePagination(data.total, data.pages);
            resultsCount.textContent = `${data.total} Jobs Found`;
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    // Render job list
    function renderJobs(jobs) {
        jobList.innerHTML = '';
        
        if (jobs.length === 0) {
            jobList.innerHTML = '<div class="no-results">No jobs found matching your criteria</div>';
            return;
        }

        jobs.forEach(job => {
            const jobElement = document.createElement('div');
            jobElement.className = 'job-item';
            jobElement.innerHTML = `
                <div class="job-info">
                    <h3 class="job-title">
                        <a href="apply-job.html?id=${job._id}">${job.title}</a>
                    </h3>
                    <div class="job-company">
                        <i class="fas fa-building"></i>
                        <span>${job.company}</span>
                    </div>
                    <div class="job-details">
                        <div class="job-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${job.location}</span>
                        </div>
                        <div class="job-detail">
                            <i class="fas fa-clock"></i>
                            <span>${job.jobType}</span>
                        </div>
                        <div class="job-detail">
                            <i class="fas fa-dollar-sign"></i>
                            <span>${job.salaryRange}</span>
                        </div>
                        <div class="job-detail">
                            <i class="fas fa-calendar"></i>
                            <span>Posted ${formatDate(job.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <div class="job-actions">
                    <button class="btn btn-primary" onclick="window.location.href='apply-job.html?id=${job._id}'">
                        Apply Now
                    </button>
                    <button class="btn btn-secondary" onclick="saveJob('${job._id}')">
                        Save Job
                    </button>
                </div>
            `;
            jobList.appendChild(jobElement);
        });
    }

    // Update pagination
    function updatePagination(total, pages) {
        pagination.innerHTML = '';
        
        if (pages <= 1) return;

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-btn';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = currentPage === 1;
        prevButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                fetchJobs();
            }
        };
        pagination.appendChild(prevButton);

        // Page numbers
        for (let i = 1; i <= pages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.onclick = () => {
                currentPage = i;
                fetchJobs();
            };
            pagination.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-btn';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled = currentPage === pages;
        nextButton.onclick = () => {
            if (currentPage < pages) {
                currentPage++;
                fetchJobs();
            }
        };
        pagination.appendChild(nextButton);
    }

    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }

    // Save job to bookmarks
    async function saveJob(jobId) {
        try {
            const userData = JSON.parse(sessionStorage.getItem('user'));
            if (!userData) {
                throw new Error('Please login to save jobs');
            }

            const response = await fetch(`/api/jobs/${jobId}/bookmark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`
                },
                body: JSON.stringify({ userId: userData.id })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            showNotification('Job saved successfully!');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Event listeners
    searchButton.addEventListener('click', () => {
        currentFilters.keyword = searchInput.value.trim();
        currentPage = 1;
        fetchJobs();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentFilters.keyword = searchInput.value.trim();
            currentPage = 1;
            fetchJobs();
        }
    });

    // Filter event listeners
    filtersSidebar.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', () => {
            currentFilters[select.name] = select.value;
            currentPage = 1;
            fetchJobs();
        });
    });

    // Sort event listener
    sortSelect.addEventListener('change', () => {
        const [sortBy, sortOrder] = sortSelect.value.split('-');
        currentFilters.sortBy = sortBy;
        currentFilters.sortOrder = sortOrder;
        fetchJobs();
    });

    // Initial fetch
    fetchJobs();
}); 