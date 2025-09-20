# Ruby compatibility fix for taint methods removed in Ruby 3.0+
# This fixes the "undefined method 'untaint'" error in Jekyll

class String
  unless String.method_defined?(:untaint)
    def untaint
      self
    end
  end
  
  unless String.method_defined?(:taint)
    def taint
      self
    end
  end
  
  unless String.method_defined?(:tainted?)
    def tainted?
      false
    end
  end
end

# Also add the same methods to any other classes that might need them
[Hash, Array, Object].each do |klass|
  klass.class_eval do
    unless method_defined?(:untaint)
      def untaint
        self
      end
    end
    
    unless method_defined?(:taint)
      def taint
        self
      end
    end
    
    unless method_defined?(:tainted?)
      def tainted?
        false
      end
    end
  end
end