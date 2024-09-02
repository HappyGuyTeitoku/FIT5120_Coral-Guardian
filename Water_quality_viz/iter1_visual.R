library(shiny)
library(leaflet)
library(plotly)
library(dplyr)
library(RSQLite)
library(htmlwidgets)
library(lubridate)

# Establish a connection to the SQLite database
db_file <- "water_monitor.db"
conn <- dbConnect(SQLite(), dbname = db_file)

# Load data from the SQLite database
site_data <- dbGetQuery(conn, "SELECT * FROM site")
water_observation <- dbGetQuery(conn, "SELECT * FROM water_observation")

# Close the database connection
dbDisconnect(conn)

# Convert the date column to a Date object for easier handling
water_observation$date <- as.Date(water_observation$date)

# Convert all relevant columns to numeric to prevent errors
water_observation <- water_observation %>%
  mutate(
    N_TOTAL = as.numeric(N_TOTAL),
    P_TOTAL = as.numeric(P_TOTAL)
  )

# Filter the most recent data for each site and each day
latest_data <- water_observation %>%
  group_by(site_id, date) %>%
  filter(row_number(desc(date)) == 1) %>% # Keep only the most recent record for each site per day
  ungroup() %>%
  group_by(site_id) %>%
  filter(date == max(date)) %>% # Keep only the most recent date for each site
  select(site_id, date, N_TOTAL, P_TOTAL)

# Join the site data with the latest observation data
merged_data <- left_join(site_data, latest_data, by = "site_id")

# Set the default site ID to "Patterson River"
default_site_id <- site_data %>% filter(site_name_short == "BRUCES CREEK AT BEECH STREET") %>% pull(site_id)

ui <- fluidPage(
  tags$head(
    # Include the Roboto Font
    tags$link(href = "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap", rel = "stylesheet"),
    
    # Custom CSS for Styling
    tags$style(HTML("
      body {
        font-family: 'Roboto', sans-serif;
      }
      
      .titlePanel {
        font-size: 64px;
        color: #333333;
        font-weight: 700;
        text-align: center; /* Center align the title */
        margin-bottom: 20px; /* Adds some space below the title */
      }
      
      h2 {
        font-size: 56px;
        color: #333333;
        font-weight: 500;
      }
      
      h3 {
        font-size: 48px;
        color: #333333;
        font-weight: 500;
      }
      
      .btn-primary {
        background-color: #4CAF50;
        color: #FFFFFF;
        border: none;
      }
      
      .btn-secondary {
        background-color: #E0E0E0;
        color: #333333;
        border: none;
      }

      .navbar-default {
        background-color: #333333;
        color: #FFFFFF;
      }

      .plotly {
        color: #333333;
      }
    "))
  ),
  
  # Center the Title Panel using fluidRow and column
  fluidRow(
    column(
      width = 12,
      align = "center", # Center the content of the column
      titlePanel("Melbourne Water Quality Dashboard")
    )
  ),
  
  fluidRow(
    column(
      width = 6,
      leafletOutput("map", height = "600px")
    ),
    column(
      width = 6,
      fluidRow(
        plotlyOutput("ringPieChart", height = "300px") 
      ),
      fluidRow(
        selectInput("trend_variable", "Choose Chemical for Trend Analysis:",
                    choices = c("Total Nitrogen", "Total Phosphate")),
        plotlyOutput("trend", height = "300px") 
      )
    )
  )
)
server <- function(input, output, session) {
  
  # Reactive value to store the selected site ID from the map
  selected_site <- reactiveVal(default_site_id)
  
  # Leaflet map visualization
  output$map <- renderLeaflet({
    leaflet(data = merged_data) %>%
      addProviderTiles(providers$CartoDB.Positron) %>%
      addMarkers(
        ~longitude, ~latitude,
        popup = ~paste(
          "<b>Name:</b>", site_name_short,
          "<br><b>Update:</b>", format(date, "%d/%m/%Y"),
          "<br><b>Total Nitrogen:</b>", ifelse(is.na(N_TOTAL), "N/A", paste(round(N_TOTAL, 3), "ug/L")),
          "<br><b>Total Phosphate:</b>", ifelse(is.na(P_TOTAL), "N/A", paste(round(P_TOTAL, 3), "ug/L"))
        ),
        layerId = ~site_id
      )
  })
  
  # Update selected site based on marker click
  observeEvent(input$map_marker_click, {
    site_id_clicked <- input$map_marker_click$id
    selected_site(site_id_clicked)
  })
  
  # Ring Pie Chart for Composition Analysis
  output$ringPieChart <- renderPlotly({
    req(selected_site())
    
    site_data_selected <- merged_data %>% filter(site_id == selected_site())
    
    if (nrow(site_data_selected) == 0 || is.na(site_data_selected$P_TOTAL) || is.na(site_data_selected$N_TOTAL)) {
      plot_ly() %>%
        layout(
          title = paste("Composition Analysis for Site:", ifelse(nrow(site_data_selected) > 0, site_data_selected$site_name_short, "Unknown")),
          annotations = list(
            x = 0.5, y = 0.5, text = "Data Unavailable", showarrow = FALSE,
            xref = "paper", yref = "paper", font = list(size = 20, color = "red")
          )
        )
    } else {
      labels <- c("Total Nitrogen", "Total Phosphate")
      values <- c(site_data_selected$N_TOTAL, site_data_selected$P_TOTAL)
      total_value <- sum(values, na.rm = TRUE)
      
      pie_chart <- plot_ly(labels = labels, values = values, type = 'pie', hole = 0.6,
                           marker = list(colors = c('#4CAF50', '#FF9800')),
                           textinfo = 'none',
                           hoverinfo = 'text',
                           text = ~paste(labels, ": ", round(values, 3), "ug/L")) %>%
        layout(title = paste("Composition Analysis for", site_data_selected$site_name_short),
               showlegend = TRUE,
               annotations = list(
                 text = "", showarrow = FALSE,
                 x = 0.5, y = 0.5, xref = 'paper', yref = 'paper',
                 font = list(size = 15, color = "black")
               ))
      
      onRender(pie_chart, sprintf("
        function(el, x) {
          el.on('plotly_click', function(d) {
            var point = d.points[0];
            var percentage = (point.value / %f) * 100; 
            if (!isNaN(percentage)) {
              Plotly.relayout(el, {
                'annotations[0].text': percentage.toFixed(1) + '%%',
                'annotations[0].font.size': 20,
                'annotations[0].font.color': point.color
              });
            } else {
              Plotly.relayout(el, {
                'annotations[0].text': 'No Data',
                'annotations[0].font.size': 20,
                'annotations[0].font.color': 'red'
              });
            }
          });
        }
      ", total_value)) 
    }
  })
  
  # Historical Trend Analysis
  output$trend <- renderPlotly({
    req(selected_site())
    
    selected_variable <- switch(input$trend_variable,
                                "Total Nitrogen" = "N_TOTAL",
                                "Total Phosphate" = "P_TOTAL",
                                "N_TOTAL")
    
    trend_data <- water_observation %>%
      filter(site_id == selected_site()) %>%
      select(date, trend_var = all_of(selected_variable)) %>%
      mutate(trend_var = as.numeric(trend_var))
    
    if (nrow(trend_data) == 0) return(NULL)
    
    y_axis_label <- switch(input$trend_variable,
                           "Total Nitrogen" = "Total Nitrogen [ug/L]",
                           "Total Phosphate" = "Total Phosphate [ug/L]",
                           "Total Nitrogen [ug/L]")
    
    most_recent_date <- max(trend_data$date, na.rm = TRUE)
    
    plot_ly(trend_data, x = ~date, y = ~trend_var, type = 'scatter', mode = 'lines+markers',
            name = input$trend_variable,
            hoverinfo = 'text',
            text = ~paste(input$trend_variable, ": ", round(trend_var, 3)),
            hoverlabel = list(bgcolor = "white", font = list(size = 12)),
            hovertemplate = paste('%{text}<br>Date: %{x|%b %d, %Y}<extra></extra>')) %>%
      layout(
        title = paste(input$trend_variable, "Trend for", merged_data$site_name_short[merged_data$site_id == selected_site()]),
        yaxis = list(title = y_axis_label),
        xaxis = list(),
        hovermode = "x unified",
        showlegend = TRUE
      )
  })
}

shinyApp(ui, server)

