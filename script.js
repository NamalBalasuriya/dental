document.addEventListener('DOMContentLoaded', function() {
    // Track currently open dropdown
    let currentOpenDropdown = null;

    // Close all dropdowns
    const closeAllDropdowns = () => {
        document.querySelectorAll('.multi-select').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        currentOpenDropdown = null;
    };

    // 1. Multi-select toggle functionality
    document.querySelectorAll('.multi-select-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const parent = this.parentElement;
            
            if (parent === currentOpenDropdown) {
                closeAllDropdowns();
                return;
            }
            
            closeAllDropdowns();
            parent.classList.add('active');
            currentOpenDropdown = parent;
        });
    });

    // 2. Done button functionality
    document.querySelectorAll('.done-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAllDropdowns();
        });
    });

    // 3. Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.multi-select')) {
            closeAllDropdowns();
        }
    });

    // 4. Update multi-select display text
    document.querySelectorAll('.multi-select-dropdown input').forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            e.stopPropagation();
            const dropdown = this.closest('.multi-select-dropdown');
            const toggle = dropdown.previousElementSibling;
            const selected = Array.from(dropdown.querySelectorAll('input:checked'))
                                .map(cb => cb.value);
            toggle.textContent = selected.length > 0 
                ? selected.join(', ') 
                : toggle.dataset.placeholder || 'Select options';
        });
    });

    // 5. Topic switching
    document.querySelectorAll('.topic').forEach(topic => {
        topic.addEventListener('click', function() {
            document.querySelectorAll('.topic').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.statement-group').forEach(group => {
                group.style.display = 'none';
            });
            
            const topicName = this.getAttribute('data-topic');
            document.querySelector(`.statement-group[data-topic="${topicName}"]`).style.display = 'block';
        });
    });
    
    // 6. YES/NO buttons
    document.querySelectorAll('.statement-options').forEach(options => {
        const noBtn = options.querySelector('.no');
        const yesBtn = options.querySelector('.yes');
        const statement = options.closest('.statement');
        
        noBtn.addEventListener('click', function() {
            noBtn.classList.add('selected');
            yesBtn.classList.remove('selected');
            statement.classList.remove('yes-selected');
        });
        
        yesBtn.addEventListener('click', function() {
            yesBtn.classList.add('selected');
            noBtn.classList.remove('selected');
            statement.classList.add('yes-selected');
        });
    });
    
    // 7. SUBMIT BUTTON (final version showing all H3 headers in subtopics)
    document.getElementById('submit-btn').addEventListener('click', function() {
        let results = '';
        const processedSubtopics = new Set();
        
        // Process all subtopics that have selected statements
        document.querySelectorAll('.subtopic').forEach(subtopic => {
            const selectedStatements = subtopic.querySelectorAll('.statement.yes-selected');
            
            if (selectedStatements.length > 0) {
                // Get all H3 headers in this subtopic
                const headers = subtopic.querySelectorAll('h3');
                
                // Add all headers that haven't been processed yet
                headers.forEach(header => {
                    const headerText = header.textContent.trim();
                    if (!processedSubtopics.has(headerText)) {
                        results += `${headerText}\n`;
                        processedSubtopics.add(headerText);
                    }
                });
                
                // Add all selected statements in this subtopic
                selectedStatements.forEach(statement => {
                    results += `${statement.querySelector('.statement-text').textContent.trim()}`;
                    
                    // Add multi-select options
                    const allSelectedValues = [];
                    statement.querySelectorAll('.multi-select').forEach(select => {
                        const selected = Array.from(select.querySelectorAll('input:checked'))
                                            .map(cb => cb.value);
                        if (selected.length > 0) {
                            allSelectedValues.push(selected.join(', '));
                        }
                    });
                    
                    if (allSelectedValues.length > 0) {
                        if (allSelectedValues.length === 1) {
                            results += ` ${allSelectedValues[0]}`;
                        } else {
                            const lastValue = allSelectedValues.pop();
                            results += ` ${allSelectedValues.join(', ')} - ${lastValue}`;
                        }
                    }
                    
                    results += '\n\n';
                });
            }
        });
        
        // Display results
        const resultsTextarea = document.getElementById('results-textarea');
        resultsTextarea.value = results.trim() || 'No statements were selected as YES.';
        document.querySelector('.results-container').style.display = 'block';
        resultsTextarea.scrollIntoView({ behavior: 'smooth' });
    });
    
    // 8. Copy button
    document.getElementById('copy-btn').addEventListener('click', function() {
        const textarea = document.getElementById('results-textarea');
        textarea.select();
        
        try {
            navigator.clipboard.writeText(textarea.value);
            this.textContent = 'Copied!';
            setTimeout(() => this.textContent = 'COPY', 2000);
        } catch (err) {
            document.execCommand('copy');
            this.textContent = 'Copied!';
            setTimeout(() => this.textContent = 'COPY', 2000);
        }
    });

    // Initialize default view
    document.querySelector('.topic.active').click();
});