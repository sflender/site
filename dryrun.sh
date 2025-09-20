#!/bin/bash
# Ruby compatibility fix for removed taint methods in Ruby 3.0+
RUBYOPT="-r$(pwd)/_plugins/ruby_compatibility.rb" bundle exec jekyll serve